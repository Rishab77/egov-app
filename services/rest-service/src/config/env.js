require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 4001,
  pg: {
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT) || 5432,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  },
};

module.exports = { env };