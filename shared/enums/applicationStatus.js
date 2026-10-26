/**
 * Mirrors the CHECK-style values used in service_applications.status.
 * Also mirrored manually in grpc-service/src/proto/citizen_services.proto
 * as a protobuf enum, since .proto files cannot import JS modules.
 */
const ApplicationStatus = Object.freeze({
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ISSUED: 'ISSUED',
});

module.exports = { ApplicationStatus };
