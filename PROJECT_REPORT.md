# Performance Comparison of REST, gRPC, and GraphQL for E-Government Microservices in Low-Bandwidth Environments

## Project Report

**Project:** Performance comparison of REST, gRPC, and GraphQL for E-Government microservices in low-bandwidth environments  
**Application domain:** Citizen services portal  
**Implementation:** Node.js, PostgreSQL, Docker Compose, k6, Toxiproxy  
**Author:** _Add your name_  
**Institution / course:** _Add institution and course_  
**Date:** _Add submission date_

> This report describes the implementation and the measurements actually run in this workspace. The network-profile experiment used a local Toxiproxy emulation; it was not performed with Linux `tc`.

## Abstract

This project implements three API styles for an E-Government citizen-services domain: REST, gRPC, and GraphQL. Each is deployed as a separate service and uses the same PostgreSQL schema and seed dataset, keeping the domain records consistent while varying the client/server protocol. Docker Compose starts the database and services. k6 scripts exercise citizen profile, application, and document operations, while Toxiproxy emulates symmetric bandwidth limits and latency on each protocol's TCP connection.

The matrix used two virtual users, 10 seconds per protocol/profile, bandwidth settings of 512 Kbps, 2 Mbps, and 10 Mbps, and 25 ms latency in each direction. All nine runs completed with all recorded checks passing. Across the matrix, observed p95 request latency ranged from 60.68 to 104.81 ms for REST, 57.93 to 77.09 ms for gRPC, and 60.43 to 69.77 ms for GraphQL. These are short, low-load, proxy-emulated measurements. They demonstrate that the APIs operated successfully under this test setup, but do not justify a universal ranking of the protocols or represent kernel-level `tc` results.

## 1. Introduction

E-Government microservices expose records and operations needed by digital public services, including citizen profiles, application status, and supporting documents. In low-bandwidth environments, protocol behavior and payload transfer can affect responsiveness. This project implements the same citizen-services domain using REST/JSON, gRPC/Protocol Buffers, and GraphQL, then compares their observed request latency and functional success under controlled proxy-emulated network conditions.

The practical goal is to provide a functioning, reproducible multi-protocol application and an initial controlled benchmark. A common database and seed dataset reduce data variance. The load scripts exercise comparable domain operations, and the network proxy applies the selected bandwidth and latency conditions to client traffic.

## 2. Aim and Objectives

### Aim

Implement and compare the performance of REST, gRPC, and GraphQL interfaces for E-Government citizen-services microservices under low-bandwidth network conditions.

### Objectives

1. Define a common relational model for citizens, service applications, and documents.
2. Provide the same core retrieval operations through three API protocols.
3. Run the services and PostgreSQL consistently using Docker Compose.
4. Exercise service operations using k6 and verify response correctness.
5. Measure request latency and successful operation checks under 512 Kbps, 2 Mbps, and 10 Mbps proxy-emulated profiles with 50 ms added round-trip latency.
6. Document the test setup, measurements, limitations, and reproduction steps.

### Research Questions

1. How does observed request latency for the implemented REST, gRPC, and GraphQL services change across the selected bandwidth profiles?
2. Do the implementations continue to return successful responses for the tested citizen-service operations under those profiles?
3. What limitations of the local proxy-emulation setup must be considered when interpreting the comparison?

## 3. Scope

The implementation covers read-oriented operations:

- retrieve a citizen profile;
- list citizens with pagination;
- retrieve an application status;
- list applications for a citizen;
- list documents for a citizen with pagination.

It does not implement citizen registration, application submission or modification, authentication, authorization, document upload, a production deployment, or a full academic thesis. Those are outside the implemented benchmark scope.

## 4. System Architecture

The system has four Docker Compose services:

| Component | Technology | Port | Responsibility |
|---|---|---:|---|
| PostgreSQL | PostgreSQL 16 Alpine | 5432 | Shared relational database |
| REST API | Express, Node.js | 4001 | HTTP/JSON routes |
| gRPC API | `@grpc/grpc-js`, Protocol Buffers | 4002 | Unary RPC methods |
| GraphQL API | Express, `graphql-http`, GraphQL | 4003 | GraphQL schema and queries |

All service containers connect to the same Compose network and PostgreSQL instance. The database schema and seed data are mounted into PostgreSQL's initialization directory by [docker-compose.yml](./docker-compose.yml). The shared schema and seed are maintained in [shared/db/schema.sql](./shared/db/schema.sql) and [shared/db/seed.sql](./shared/db/seed.sql).

The benchmark client connects through a Toxiproxy instance on localhost ports 4101–4103. Each proxy forwards to the corresponding published service port. The proxy management API is bound to localhost port 8474.

### Architecture flow

```text
k6 REST client ----\
k6 gRPC client -----+--> Toxiproxy profile proxy --> protocol service --> PostgreSQL
k6 GraphQL client --/        (local TCP path)         (shared data)
```

## 5. Data Model

The PostgreSQL database contains three tables:

### `citizens`

Stores the citizen identifier, name, unique citizenship number, district, province, optional phone and email, date of birth, and creation timestamp.

### `service_applications`

Stores a citizen foreign key, service name, status, submission/update timestamps, and optional remarks. Application records are removed when their citizen is deleted.

### `documents`

Stores a citizen foreign key, optional application foreign key, document type, file name, file size, and upload timestamp. Deleting a citizen removes associated documents; deleting an application leaves the document but sets its application reference to null.

The seed dataset provides 10 citizens, 11 service applications, and 11 documents. Example status values include `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, and `ISSUED`. Document types include citizenship certificates, passport copies, land deeds, tax clearances, and recommendation letters.

The database columns use indexes on application-to-citizen and document-to-citizen/application references. Pagination defaults and maximum limit are centralized in [shared/constants/pagination.js](./shared/constants/pagination.js).

## 6. API Design

### REST

The REST API is rooted at `/api`:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health response |
| GET | `/api/citizens/:citizenId` | Retrieve a citizen profile |
| GET | `/api/citizens?limit=&offset=` | List citizens |
| GET | `/api/applications/:applicationId` | Retrieve application status |
| GET | `/api/applications/by-citizen/:citizenId` | List a citizen's applications |
| GET | `/api/documents/by-citizen/:citizenId?limit=&offset=` | List a citizen's documents |

Implementation is organized into Express routes, controllers, repositories, middleware, and utilities under [services/rest-service](./services/rest-service).

### gRPC

The gRPC service is defined in [services/grpc-service/src/proto/citizen_services.proto](./services/grpc-service/src/proto/citizen_services.proto). Its unary methods are:

- `GetCitizenProfile`
- `ListCitizens`
- `GetApplicationStatus`
- `ListApplicationsByCitizen`
- `ListDocumentsByCitizen`

The schema uses Protocol Buffers messages and enums. gRPC field names are snake_case to match the protocol definition.

### GraphQL

The GraphQL endpoint is `/graphql`; `/health` provides a health response. The query fields are:

- `citizenProfile(citizenId)`
- `citizens(limit, offset)`
- `applicationStatus(applicationId)`
- `applicationsByCitizen(citizenId)`
- `documentsByCitizen(citizenId, limit, offset)`

The schema and resolver implementation are in [services/graphql-service/src/schema/typeDefs.js](./services/graphql-service/src/schema/typeDefs.js) and [services/graphql-service/src/schema/resolvers.js](./services/graphql-service/src/schema/resolvers.js).

## 7. Implementation and Technology

- **Node.js:** runtime for the three services.
- **Express:** REST server and GraphQL HTTP integration.
- **`@grpc/grpc-js` and `@grpc/proto-loader`:** gRPC server and runtime loading of the `.proto` file.
- **`graphql` and `graphql-http`:** GraphQL schema, execution, and HTTP handling.
- **`pg`:** PostgreSQL driver and connection pools.
- **PostgreSQL 16:** common relational data store.
- **Docker Compose:** repeatable local service startup and dependency ordering.
- **k6:** load generation and summary export.
- **Toxiproxy:** TCP bandwidth and latency emulation when kernel-level traffic-control qdiscs are unavailable.

## 8. Benchmark Methodology

### 8.1 Test setup

- Client: k6 on Windows.
- Services and database: local Docker Compose stack.
- Proxy: local Toxiproxy, with separate listeners for REST, gRPC, and GraphQL.
- Load: 2 virtual users per run.
- Duration: 10 seconds per protocol/profile.
- Profiles: 512 Kbps, 2 Mbps, and 10 Mbps.
- Latency: 25 ms on each direction (nominally 50 ms additional round-trip latency).
- Bandwidth is configured separately for upstream and downstream on each proxy.

Toxiproxy's bandwidth rate is expressed in kilobytes per second. The configured rates are 64 KB/s, 250 KB/s, and 1,250 KB/s, corresponding approximately to 512 Kbps, 2 Mbps, and 10 Mbps using decimal units.

### 8.2 Operations and checks

The REST and GraphQL scripts check health and the citizen, application-list, and document-list operations; REST also tests citizen listing. The gRPC script checks citizen profile, citizen listing, applications, and documents. A k6 check passes when the request returns a successful response and, for GraphQL, contains no execution errors.

### 8.3 Matrix execution

The full run was performed with:

```powershell
Set-Location E:\egov-app
docker compose up -d
powershell -ExecutionPolicy Bypass -File .\scripts\k6\run-proxy-matrix.ps1 `
  -Profiles 512,2000,10000 -VUs 2 -Duration 10s
```

The runner configures the local proxy, clears old profile toxics before each case, runs all three protocol scripts, exports JSON summaries and text logs, and removes toxics in a `finally` block. The matrix completed and all nine result summaries reported zero failed checks.

## 9. Results

### 9.1 Summary

| Bandwidth profile | REST: passed checks; p95 | gRPC: passed checks; p95 | GraphQL: passed checks; p95 |
|---|---:|---:|---:|
| 512 Kbps | 220/220; 104.81 ms | 208/208; 77.09 ms | 224/224; 69.77 ms |
| 2 Mbps | 250/250; 69.28 ms | 224/224; 61.79 ms | 240/240; 62.93 ms |
| 10 Mbps | 260/260; 60.68 ms | 232/232; 57.93 ms | 248/248; 60.43 ms |

**Overall:** 9 of 9 protocol/profile runs completed; every reported k6 check passed. Exact per-run counts vary because the test duration is fixed and the protocols have different iteration rates.

Raw summary files and corresponding logs are stored under [results/](./results/):

- REST: `rest-proxy-512.json`, `rest-proxy-2000.json`, `rest-proxy-10000.json`
- gRPC: `grpc-proxy-512.json`, `grpc-proxy-2000.json`, `grpc-proxy-10000.json`
- GraphQL: `graphql-proxy-512.json`, `graphql-proxy-2000.json`, `graphql-proxy-10000.json`

### 9.2 Interpretation

The measurements show higher p95 latency at the 512 Kbps profile than at the faster profiles in this run, consistent with the added bandwidth constraint. All services remained functionally responsive for the test operations. In this specific run, gRPC had the lowest p95 at 2 Mbps and 10 Mbps, while GraphQL had the lowest p95 at 512 Kbps. These observations are descriptive only; the short run and differing request shapes do not support a broad claim that one protocol is universally faster.

The results should not be interpreted as a definitive protocol ranking. The sample duration and virtual-user count are small; operations and payload sizes are not perfectly identical across protocols; and p95 values can be affected by startup, local host scheduling, proxy implementation, and connection behavior. Longer repeated runs, confidence intervals, consistent operation-by-operation scenarios, and system resource measurements would improve the strength of conclusions.

## 10. Testing and Verification

Testing was performed against the live Docker Compose services and their seeded PostgreSQL database. The repository currently has k6 benchmark scenarios but does not define `test` scripts or a dedicated unit-test framework in the service package manifests.

| Test | Coverage | Result |
|---|---|---|
| Docker Compose startup | PostgreSQL health check and REST, gRPC, and GraphQL service containers | Passed; four containers reported running |
| REST integration checks | Health, citizen profile, citizen list, application status, applications by citizen, documents by citizen | Passed; six route assertions |
| GraphQL integration checks | Citizen profile, applications, and documents query results | Passed; four query/data assertions |
| gRPC k6 smoke test | Get citizen, list citizens, list applications, list documents | Passed in the separate smoke run; 328/328 checks |
| Proxy-emulated benchmark matrix | All three protocols under 512 Kbps, 2 Mbps, and 10 Mbps | Passed; 9/9 runs and zero failed checks |
| Shell-script syntax | `bash -n` on tc and shell benchmark scripts | Passed |
| Diff whitespace validation | `git diff --check` | Passed |

The REST and GraphQL integration checks were run as direct assertions against the live endpoints. The matrix results and full k6 output are retained in `results/`. A passing smoke/matrix run indicates that the exercised paths returned successfully; it does not establish exhaustive functional correctness, security, high-load capacity, or production readiness.

### Reproduction

```powershell
Set-Location E:\egov-app
docker compose up -d --build
powershell -ExecutionPolicy Bypass -File .\scripts\k6\run-proxy-matrix.ps1 `
  -Profiles 512,2000,10000 -VUs 2 -Duration 10s
```

Inspect the JSON summaries and `.log` files under `results/`. A successful run should finish without k6 errors and should report zero failed checks for every protocol/profile.

## 11. Limitations and Validity

1. **Proxy emulation, not `tc`:** WSL2 and Docker kernels in this environment rejected both `netem` and TBF qdiscs. The experiment therefore used Toxiproxy. This provides TCP-level emulation but is not a kernel-level `tc` experiment.
2. **One machine:** Client, proxy, and services run locally on the same development machine. This does not represent geographic or production network conditions.
3. **Short load duration:** Ten seconds and two VUs are suitable for a smoke matrix, not capacity, soak, or stress testing.
4. **Seed-scale dataset:** The database is small and deterministic. Query behavior may differ on a production-sized dataset.
5. **Different protocol request shapes:** GraphQL query selection and gRPC serialization differ from REST JSON; each scenario covers equivalent domain intent, not identical bytes or exactly identical endpoint combinations.
6. **No authentication or writes:** These are read-oriented benchmark endpoints and do not represent a complete production citizen-services platform.
7. **No formal statistical analysis:** The measurements are single-run summaries without repeated-run variance estimates or confidence intervals.

Accordingly, describe these as **local Toxiproxy-emulated benchmark results**, not as measurements from a real WAN or from Linux `tc`.

## 12. Reproduction and Operation

### Start the application

```powershell
Set-Location E:\egov-app
docker compose up -d --build
```

### Run the proxy-emulated matrix

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\k6\run-proxy-matrix.ps1 `
  -Profiles 512,2000,10000 -VUs 2 -Duration 10s
```

If k6 is installed at a non-default location, pass it explicitly:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\k6\run-proxy-matrix.ps1 `
  -K6Path "C:\path\to\k6.exe" -Profiles 512,2000,10000 -VUs 2 -Duration 10s
```

### Stop the application

```powershell
docker compose down
```

The database uses a named Docker volume. To intentionally remove the database volume and its contents, use `docker compose down -v`; this is destructive and not required for normal shutdown.

## 13. Security and Data Notes

The services and benchmark setup are for local development and evaluation. Do not expose these ports publicly without appropriate authentication, authorization, TLS, input controls, and operational safeguards. Use synthetic or approved data only. Never include credentials, personal access tokens, or real citizen data in source control or reports.

## 14. Conclusion

The project successfully implements three citizen-service API protocols over a common PostgreSQL schema and seed dataset. Docker Compose runs the services, and the k6 suite verified the three protocols under all three proxy-emulated bandwidth profiles with no failed checks. The report and raw measurements are reproducible from the included runner.

The completed experiment is a local, Toxiproxy-based emulation. The machine's available kernels cannot execute the corresponding `tc` qdisc setup, so the results must not be described as kernel-level traffic shaping. Within that limitation, the project meets its implementation and proxy-emulated benchmark objectives.

## Appendix A: Project Layout

```text
docker-compose.yml                 Application/database orchestration
shared/db/schema.sql              Common relational schema
shared/db/seed.sql                Deterministic seed dataset
services/rest-service/            REST API
services/grpc-service/            gRPC API and Protocol Buffers definition
services/graphql-service/         GraphQL API and schema
scripts/k6/                       k6 scenarios and benchmark runners
scripts/tc/                       Linux traffic-control scripts (kernel support required)
results/                           Generated benchmark summaries and logs
```
