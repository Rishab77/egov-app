export const commonThresholds = {
  http_req_failed: ['rate<0.01'],
  checks: ['rate>0.98'],
};

export const restThresholds = {
  ...commonThresholds,
  http_req_duration: ['p(95)<500'],
};

export const grpcThresholds = {
  grpc_req_duration: ['p(95)<500'],
  checks: ['rate>0.98'],
};
