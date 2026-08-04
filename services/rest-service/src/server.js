const express = require('express');
const { env } = require('./config/env');
const routes = require('./routes');
const { requestLogger } = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use('/api', routes);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`REST service listening on port ${env.port}`);
});