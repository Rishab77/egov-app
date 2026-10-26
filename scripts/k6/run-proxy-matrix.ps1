param(
  [int[]]$Profiles = @(512, 2000, 10000),
  [int]$VUs = 2,
  [string]$Duration = '10s',
  [string]$K6Path = 'C:\k6\k6-v0.57.0-windows-amd64\k6.exe',
  [string]$ToxiproxyApi = 'http://127.0.0.1:8474'
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$results = Join-Path $root 'results'
$infrastructureReady = $false
$proxies = @(
  @{ Name = 'egov-rest'; Protocol = 'rest'; Port = 4101; Upstream = 'host.docker.internal:4001' },
  @{ Name = 'egov-grpc'; Protocol = 'grpc'; Port = 4102; Upstream = 'host.docker.internal:4002' },
  @{ Name = 'egov-graphql'; Protocol = 'graphql'; Port = 4103; Upstream = 'host.docker.internal:4003' }
)

if (-not (Test-Path $K6Path)) {
  throw "k6 executable not found: $K6Path"
}

New-Item -ItemType Directory -Force -Path $results | Out-Null
$apiHeaders = @{ 'User-Agent' = 'egov-benchmark' }

function Ensure-ProxyInfrastructure {
  try {
    Invoke-RestMethod -Uri "$ToxiproxyApi/version" -Headers $apiHeaders | Out-Null
  } catch {
    $existingContainer = docker ps -a --filter 'name=^/egov-toxiproxy$' --format '{{.Names}}'
    if ($LASTEXITCODE -ne 0) {
      throw 'Docker is unavailable. Start Docker Desktop and retry.'
    }
    if ($existingContainer -contains 'egov-toxiproxy') {
      docker start egov-toxiproxy | Out-Null
    } else {
      docker run -d --name egov-toxiproxy `
        -p 127.0.0.1:8474:8474 `
        -p 127.0.0.1:4101:4101 `
        -p 127.0.0.1:4102:4102 `
        -p 127.0.0.1:4103:4103 `
        ghcr.io/shopify/toxiproxy:2.12.0 | Out-Null
    }
  }

  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
      Invoke-RestMethod -Uri "$ToxiproxyApi/version" -Headers $apiHeaders | Out-Null
      $ready = $true
      break
    } catch {
      Start-Sleep -Seconds 1
    }
  }
  if (-not $ready) {
    throw "Toxiproxy API did not become ready at $ToxiproxyApi."
  }

  $configured = Invoke-RestMethod -Uri "$ToxiproxyApi/proxies" -Headers $apiHeaders
  foreach ($proxy in $proxies) {
    if ($null -eq $configured.PSObject.Properties[$proxy.Name]) {
      $definition = @{
        name = $proxy.Name
        listen = "0.0.0.0:$($proxy.Port)"
        upstream = $proxy.Upstream
      } | ConvertTo-Json -Compress
      Invoke-RestMethod -Method Post -Uri "$ToxiproxyApi/proxies" -Headers $apiHeaders -ContentType 'application/json' -Body $definition | Out-Null
    }
  }
}

function Remove-ProfileToxics {
  foreach ($proxy in $proxies) {
    $toxics = Invoke-RestMethod -Uri "$ToxiproxyApi/proxies/$($proxy.Name)/toxics" -Headers $apiHeaders
    foreach ($toxic in $toxics) {
      Invoke-RestMethod -Method Delete -Uri "$ToxiproxyApi/proxies/$($proxy.Name)/toxics/$($toxic.name)" -Headers $apiHeaders | Out-Null
    }
  }
}

function Add-ProfileToxics([int]$BandwidthKbps) {
  $rateKilobytesPerSecond = [Math]::Max(1, [Math]::Floor($BandwidthKbps / 8))
  foreach ($proxy in $proxies) {
    foreach ($stream in @('upstream', 'downstream')) {
      $latency = @{
        name = "latency_$stream"
        type = 'latency'
        stream = $stream
        attributes = @{ latency = 25; jitter = 0 }
      }
      $bandwidth = @{
        name = "bandwidth_$stream"
        type = 'bandwidth'
        stream = $stream
        attributes = @{ rate = $rateKilobytesPerSecond }
      }
      Invoke-RestMethod -Method Post -Uri "$ToxiproxyApi/proxies/$($proxy.Name)/toxics" -Headers $apiHeaders -ContentType 'application/json' -Body ($latency | ConvertTo-Json -Depth 5 -Compress) | Out-Null
      Invoke-RestMethod -Method Post -Uri "$ToxiproxyApi/proxies/$($proxy.Name)/toxics" -Headers $apiHeaders -ContentType 'application/json' -Body ($bandwidth | ConvertTo-Json -Depth 5 -Compress) | Out-Null
    }
  }
}

try {
  Ensure-ProxyInfrastructure
  $infrastructureReady = $true
  foreach ($profile in $Profiles) {
    if ($profile -notin @(512, 2000, 10000)) {
      throw "Unsupported profile $profile. Valid values: 512, 2000, 10000."
    }

    Remove-ProfileToxics
    Add-ProfileToxics $profile
    Write-Host "Running proxy-emulated profile ${profile} Kbps (25ms each direction, ${VUs} VUs, ${Duration})"

    foreach ($proxy in $proxies) {
      $env:REST_URL = "http://127.0.0.1:$($proxies[0].Port)"
      $env:GRPC_URL = "127.0.0.1:$($proxies[1].Port)"
      $env:GRAPHQL_URL = "http://127.0.0.1:$($proxies[2].Port)/graphql"
      $summaryPath = Join-Path $results "$($proxy.Protocol)-proxy-$profile.json"
      $logPath = Join-Path $results "$($proxy.Protocol)-proxy-$profile.log"
      $scriptPath = Join-Path $PSScriptRoot "$($proxy.Protocol).test.js"

      & $K6Path run --vus $VUs --duration $Duration --summary-export $summaryPath $scriptPath *> $logPath
      if ($LASTEXITCODE -ne 0) {
        Get-Content $logPath -Tail 60
        throw "k6 $($proxy.Protocol) test failed for profile $profile."
      }
    }
  }
}
finally {
  if ($infrastructureReady) {
    Remove-ProfileToxics
  }
  Remove-Item Env:REST_URL, Env:GRPC_URL, Env:GRAPHQL_URL -ErrorAction SilentlyContinue
}

Write-Host "Proxy-emulated benchmark matrix complete. Results: $results"
