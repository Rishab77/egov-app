const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const { env } = require('./config/env');
const { schema } = require('./schema/typeDefs');
const { root } = require('./schema/resolvers');

const app = express();

app.get('/health', (req, res) => res.json({ status: 'ok', protocol: 'GraphQL' }));

app.all(
  '/graphql',
  createHandler({
    schema,
    rootValue: root,
  })
);

app.listen(env.port, () => {
  console.log(`GraphQL service listening on port ${env.port}`);
});