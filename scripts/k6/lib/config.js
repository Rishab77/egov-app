export const REST_URL = __ENV.REST_URL || 'http://127.0.0.1:4001';
export const GRPC_URL = __ENV.GRPC_URL || '127.0.0.1:4002';
export const GRAPHQL_URL = __ENV.GRAPHQL_URL || 'http://127.0.0.1:4003/graphql';
export const VUS = Number(__ENV.VUS || 10);
export const DURATION = __ENV.DURATION || '30s';
export const REQUEST_TIMEOUT_MS = Number(__ENV.REQUEST_TIMEOUT_MS || 2000);
