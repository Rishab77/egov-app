# Citizen Services Protocol Benchmark Report

## Overview
This report summarizes live benchmark results for the three protocol implementations of the citizen services API:

- REST over HTTP/1.1
- gRPC over HTTP/2
- GraphQL over HTTP

All services are backed by the same PostgreSQL database and populated with the same seed data. The benchmark objective is to compare protocol overhead while keeping the domain and data constant.

## Environment
- PostgreSQL: running in Docker Compose
- REST: http://127.0.0.1:4001
- gRPC: 127.0.0.1:4002
- GraphQL: http://127.0.0.1:4003/graphql

## Test Method
The matrix used k6 with 2 virtual users and a 10-second duration per protocol and profile. REST, gRPC, and GraphQL requests all passed through local Toxiproxy TCP proxies. Each proxy applied a symmetric bandwidth toxic and 25 ms latency in each direction (50 ms added round-trip latency).

- VUs: 2
- Duration: 10s per test
- Profiles: 512 Kbps, 2 Mbps, and 10 Mbps
- Operations tested:
  - citizen profile lookup
  - list citizens
  - application listing by citizen
  - document listing by citizen
  - GraphQL and REST health checks
- Bandwidth toxic rates: 64 KB/s, 250 KB/s, and 1,250 KB/s respectively

## Results Summary

| Protocol | Method | Status | Iterations | Checks | Success Rate | p95 Latency | Notes |
|---|---|---:|---:|---:|---:|---:|---|
| REST | Proxy-emulated matrix | Passed | 44–52/profile | 220–260/profile | 100% | 60.68–104.81 ms | All 3 profiles passed |
| GraphQL | Proxy-emulated matrix | Passed | 56–62/profile | 224–248/profile | 100% | 60.43–69.77 ms | All 3 profiles passed |
| gRPC | Proxy-emulated matrix | Passed | 52–58/profile | 208–232/profile | 100% | 57.93–77.09 ms | All 3 profiles passed |

### Per-profile results

| Profile | REST checks / p95 | GraphQL checks / p95 | gRPC checks / p95 |
|---|---:|---:|---:|
| 512 Kbps | 220/220, 104.81 ms | 224/224, 69.77 ms | 208/208, 77.09 ms |
| 2 Mbps | 250/250, 69.28 ms | 240/240, 62.93 ms | 224/224, 61.79 ms |
| 10 Mbps | 260/260, 60.68 ms | 248/248, 60.43 ms | 232/232, 57.93 ms |

The nine raw k6 summary files are `results/{rest,grpc,graphql}-proxy-{512,2000,10000}.json`; matching `.log` files contain the full k6 output.

## Interpretation
All nine protocol/profile tests completed with 100% passing checks. Latencies generally approach the 50 ms injected round-trip delay as bandwidth increases. These short runs validate the services under reproducible proxy emulation, but are not sufficient by themselves to establish a general protocol performance ranking; iteration counts are low and each protocol's request shape and payload size differ.

## Traffic-Profile Matrix Status
The requested profile matrix is complete using Toxiproxy, not Linux `tc`. The available WSL2 and Docker kernels reject qdiscs with `Specified qdisc kind is unknown`, and WSL2 lacks the IFB module. The Toxiproxy fallback applies bandwidth and latency in both TCP directions. This is a user-space emulation and should be identified as such in any submission; it is not a tc-based kernel network-shaping experiment.

The matrix can be reproduced on Windows with Docker Desktop and k6 installed. The runner starts/configures the Toxiproxy container and the three proxies automatically, targeting the services on ports 4001–4003:
```bash
.\scripts\k6\run-proxy-matrix.ps1 -Profiles 512,2000,10000 -VUs 2 -Duration 10s
```
The script writes a summary JSON and log for each protocol/profile under `results/`, and removes all profile toxics on exit.

## Commands Used

Standalone REST smoke benchmark:
```bash
C:\k6\k6-v0.57.0-windows-amd64\k6.exe run --vus 2 --duration 10s --summary-export E:\egov-app\results\rest-summary.json E:\egov-app\scripts\k6\rest.test.js
```

Standalone GraphQL smoke benchmark:
```bash
C:\k6\k6-v0.57.0-windows-amd64\k6.exe run --vus 2 --duration 10s --summary-export E:\egov-app\results\graphql-summary.json E:\egov-app\scripts\k6\graphql.test.js
```

Direct gRPC validation:
```bash
docker exec egov-grpc node -e "const path=require('path'); const grpc=require('@grpc/grpc-js'); const protoLoader=require('@grpc/proto-loader'); const PROTO_PATH=path.join('/app/services/grpc-service/src/proto/citizen_services.proto'); const pkg=protoLoader.loadSync(PROTO_PATH,{keepCase:true,longs:String,enums:String,defaults:true,oneofs:true}); const proto=grpc.loadPackageDefinition(pkg).citizenservices; const client=new proto.CitizenServices('127.0.0.1:4002', grpc.credentials.createInsecure()); client.GetCitizenProfile({citizen_id:1}, (err,res)=>{ if(err){ console.error(err.message); process.exit(1); } console.log(JSON.stringify(res)); });"
```

## Conclusion
All three services passed the nine-case 512 Kbps / 2 Mbps / 10 Mbps matrix using local TCP proxy emulation, with a 100% check pass rate. The target machine cannot perform the same experiment with `tc` because its kernels do not include the required qdisc support. The results are valid for the stated proxy-emulation setup, not evidence from kernel-level `tc` shaping.
