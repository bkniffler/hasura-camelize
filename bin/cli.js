#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

require('../build/main').hasuraCamelize(
  {
    host: argv.host,
    secret: argv.secret,
    schema: argv.schema,
    source: argv.source,
  },
  {
    dry: argv.dry,
  }
);
