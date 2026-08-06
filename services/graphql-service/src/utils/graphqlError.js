const { GraphQLError } = require('graphql');

function notFound(message) {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });
}

function invalidArgument(message) {
  return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

module.exports = { notFound, invalidArgument };