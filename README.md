# Hasura table/column/relations camelizer

## Installation

```bash
npm i -g hasura-camelize
```

## Usage

```bash
# Table names, rootfields, relation names and materialized views
hasura-camelize --host https://some.domain --secret some-secret --relations --pgMaterializedViews
```

## Args/Flags

- _required_ host=string: Host, e.g. https://some.domain
- _optional_ secret=string: Admin secret if set
- _optional_ dry: Only show what would be done, without actually doing it
- _optional_ exclude=string[]: Exclude tables from being changed
- _optional_ include=string[]: Only change the tables specified
- _optional_ _new_ relations: relation names to be renamed
- _optional_ _new_ pgMaterializedViews: Rename postgresql materialized views/columns also
- _optional_ _new_ pattern: Renaming pattern, default will result in names e.g. 'usersInsert', 'invert' results in e.g. 'insertUsers'
- _optional_ _new_ insecure-skip-tls-verify: Allow for insecure https hasura endpoints (eg, self signed certificates). Not recommended for use against production deployments.

## From code

### Simple

```ts
import convert from 'hasura-camelize';

convert(
  // connection settings
  {
    // domain name
    host: 'https://some.domain',
    // or ip
    host: 'http://127.0.0.1:3000',
    // admin secret
    secret: 'some-secret',
    // more flags as seen above
    relations: true,
  }
);
```

### Complex

```ts
import convert from 'hasura-camelize';

convert(
  // connection settings
  {
    // domain name
    host: 'https://some.domain',
    // or ip
    host: 'http://127.0.0.1:3000',
    // admin secret
    secret: 'some-secret',
    // optional schema (default 'public')
    schema: 'public',
    // optional source (default 'default')
    source: 'default',
  },
  // optional settings
  {
    // Dry run? (don't apply changes)
    dry: false,
    // Rename relations? (default false)
    relations: true,
    // Transform table names differently
    transformTableNames(
      name,
      defaultTransformer
    ) {
      // if name === some_name then ignore the table
      if (name === 'some_name') return false;
      return defaultTransformer(name);
    };
    // Transform column names differently
    transformColumnNames(
      name,
      tableName,
      defaultTransformer
    ) {
      // if name === some_name then ignore the column
      if (name === 'some_name' && tableName === 'some_name') return false;
      return defaultTransformer(name);
    };
    // Apply different root field names
    getRootFieldNames(
      name,
      defaultTransformer
    ) {
      return defaultTransformer(name);
    };
  }
);
```

## Changes

### 2.0.0

- Add: updateMany and selectStream root fields

### 1.2.4

- Add: --pattern argument

### 1.2.3

- Fix: Don't post columns that produce the same name (e.g. `col1` -> `col1`)

## Credits

- Original github issue in hasura repository: https://github.com/hasura/graphql-engine/issues/3320
- User @svarlamov for https://github.com/exlinc/hasura-enforce-camel-case
- User @m-rgba for https://github.com/m-rgba/hasura-snake-to-camel
