#!/usr/bin/env node

const { resolve } = require('path');
require('dotenv').config({ path: resolve(process.cwd(), '.env') });
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
const {
  hasuraCamelize,
  defaultSchema,
  defaultSource,
} = require('../build/main');

const exclude = argv.exclude && argv.exclude.split(',').map((x) => x.trim());
const include = argv.include && argv.include.split(',').map((x) => x.trim());

hasuraCamelize(
  {
    host: argv.host || argv.endpoint || process.env.HASURA_GRAPHQL_ENDPOINT,
    secret: argv.secret || argv['admin-secret'] || process.env.HASURA_GRAPHQL_ADMIN_SECRET,
    schema: argv.schema || process.env.HASURA_GRAPHQL_SCHEMA || defaultSchema,
    source: argv.source || process.env.HASURA_GRAPHQL_SOURCE || defaultSource,
  },
  {
    dry: argv.dry,
    relations: argv.relations,
    pattern: argv.pattern,
    transformTableNames(tableName, defaultTransform) {
      if (exclude && exclude.includes(tableName)) {
        return undefined;
      }
      if (include && !include.includes(tableName)) {
        return undefined;
      }
      return defaultTransform(tableName);
    },
  }
).catch((err) => console.error(err));
