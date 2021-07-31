# Hasura TableName converter

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
      defaultTransformer
    ) {
      // if name === some_name then ignore the column
      if (name === 'some_name') return false;
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
