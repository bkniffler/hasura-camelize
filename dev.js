const { resolve } = require('path');
require('dotenv').config({ path: resolve(__dirname, '.env') });
const {
  hasuraCamelize,
  defaultSchema,
  defaultSource,
} = require('./build/main');

hasuraCamelize(
  {
    host: process.env.HASURA_GRAPHQL_HOST,
    secret: process.env.HASURA_ADMIN_SECRET,
    schema: process.env.HASURA_GRAPHQL_SCHEMA || defaultSchema,
    source: process.env.HASURA_GRAPHQL_SOURCE || defaultSource,
  },
  {
    dry: true,
    relations: true,
  }
).catch((err) => console.error(err));
