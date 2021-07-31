#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const exclude = argv.exclude && argv.exclude.split(',').map((x) => x.trim());
const include = argv.include && argv.include.split(',').map((x) => x.trim());
require('../build/main').hasuraCamelize(
  {
    host: argv.host,
    secret: argv.secret,
    schema: argv.schema,
    source: argv.source,
  },
  {
    dry: argv.dry,
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
);
