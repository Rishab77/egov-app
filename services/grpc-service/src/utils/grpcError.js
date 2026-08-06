const grpc = require('@grpc/grpc-js');

function notFound(message) {
  return { code: grpc.status.NOT_FOUND, message };
}

function invalidArgument(message) {
  return { code: grpc.status.INVALID_ARGUMENT, message };
}

function internal(message) {
  return { code: grpc.status.INTERNAL, message };
}

module.exports = { notFound, invalidArgument, internal };