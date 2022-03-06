const { resolve } = require('path');
require('dotenv').config({ path: resolve(__dirname, '.env') });
const {
  hasuraCamelize,
  defaultSchema,
  defaultSource,
} = require('./build/main');

hasuraCamelize(
  {
    host: process.env.HASURA_GRAPHQL_ENDPOINT,
    secret: process.env.HASURA_GRAPHQL_ADMIN_SECRET,
    schema: process.env.HASURA_GRAPHQL_SCHEMA || defaultSchema,
    source: process.env.HASURA_GRAPHQL_SOURCE || defaultSource,
  },
  {
    dry: false,
    relations: true,
    pgMaterializedViews: true,
  }
).catch((err) => console.error(err));
