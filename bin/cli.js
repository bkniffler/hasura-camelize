#!/usr/bin/env node

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
    host: argv.host,
    secret: argv.secret,
    schema: argv.schema || defaultSchema,
    source: argv.source || defaultSource,
  },
  {
    dry: argv.dry,
    relations: argv.relations,
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
