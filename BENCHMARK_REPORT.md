# Citizen Services Protocol Benchmark Report

## Overview
This report summarizes the live benchmark smoke test results for the three protocol implementations of the citizen services API:

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
The validation was performed using k6 smoke tests with a short-duration, low-VU run:

- VUs: 2
- Duration: 10s
- Operations tested:
  - citizen profile lookup
  - list citizens
  - application listing by citizen
  - document listing by citizen
  - GraphQL and REST health checks

## Results Summary

| Protocol | Method | Status | Iterations | Checks | Success Rate | p95 Latency | Notes |
|---|---|---:|---:|---:|---:|---:|---|
| REST | k6 smoke test | Passed | 168 | 840/840 | 100% | ~6.65 ms | Lowest latency in this run |
| GraphQL | k6 smoke test | Passed | 168 | 672/672 | 100% | ~9.31 ms | Healthy and responsive |
| gRPC | Direct RPC validation | Passed | 1 live call | 1/1 | 100% | Not measured in k6 | Service responded with valid payload |

### REST
- Status: Passed
- Iterations: 168
- Checks: 840 / 840 passed
- Success rate: 100%
- p95 latency: ~6.65 ms

### GraphQL
- Status: Passed
- Iterations: 168
- Checks: 672 / 672 passed
- Success rate: 100%
- p95 latency: ~9.31 ms

### gRPC
- Status: Verified via live RPC invocation
- Direct RPC call succeeded: GetCitizenProfile({ citizen_id: 1 })
- Response returned valid citizen payload from the server

## Interpretation
Under this short smoke-test run, REST shows the lowest latency, followed by GraphQL, while gRPC is functionally healthy and returned valid data. The benchmark is intended to measure protocol-level efficiency under controlled network conditions, and the current run confirms the services are operational and responsive.

## Commands Used

REST benchmark:
```bash
C:\k6\k6-v0.57.0-windows-amd64\k6.exe run --vus 2 --duration 10s --summary-export E:\egov-app\results\rest-summary.json E:\egov-app\scripts\k6\rest.test.js
```

GraphQL benchmark:
```bash
C:\k6\k6-v0.57.0-windows-amd64\k6.exe run --vus 2 --duration 10s --summary-export E:\egov-app\results\graphql-summary.json E:\egov-app\scripts\k6\graphql.test.js
```

Direct gRPC validation:
```bash
docker exec egov-grpc node -e "const path=require('path'); const grpc=require('@grpc/grpc-js'); const protoLoader=require('@grpc/proto-loader'); const PROTO_PATH=path.join('/app/services/grpc-service/src/proto/citizen_services.proto'); const pkg=protoLoader.loadSync(PROTO_PATH,{keepCase:true,longs:String,enums:String,defaults:true,oneofs:true}); const proto=grpc.loadPackageDefinition(pkg).citizenservices; const client=new proto.CitizenServices('127.0.0.1:4002', grpc.credentials.createInsecure()); client.GetCitizenProfile({citizen_id:1}, (err,res)=>{ if(err){ console.error(err.message); process.exit(1); } console.log(JSON.stringify(res)); });"
```

## Conclusion
The project is functionally working across all three protocols, the shared database and benchmark harness are in place, and the services respond correctly under a live smoke-test scenario. The next step for deeper benchmarking is to use the traffic-control profiles and run the full k6 suite under controlled network conditions.
