import { DBOptionsType, MetadataType } from './types';
import fetch, { RequestInit } from 'node-fetch';

export const defaultSource = 'default';
export const defaultSchema = 'public';

function sqlColumnInfoToObject(result: string[][], ignore: string) {
  return result.reduce<{ [s: string]: string[] }>((state, value) => {
    if (value[1] !== ignore) {
      const fieldName = value[0];
      const tableName = value[1];
      if (!state[tableName]) {
        state[tableName] = [];
      }
      state[tableName].push(fieldName);
    }
    return state;
  }, {});
}

// Get tables and table columns
export async function fetchData({
  host,
  secret,
  schema = defaultSchema,
  source = defaultSource,
}: DBOptionsType) {
  const { result } = await fetchJson<{ result: string[][] }>(
    `${host}/v2/query`,
    {
      method: 'post',
      body: {
        type: 'run_sql',
        args: {
          source,
          sql: `SELECT column_name, table_name, is_generated, is_identity, identity_generation FROM information_schema.columns where table_schema = '${schema}';`,
          cascade: false,
          read_only: true,
        },
      },
      headers: {
        'x-hasura-admin-secret': secret,
      },
    }
  );
  return sqlColumnInfoToObject(result, 'table_name');
}

// Get tables and table columns
export async function fetchPGMaterializedViewData({
  host,
  secret,
  schema = defaultSchema,
  source = defaultSource,
}: DBOptionsType) {
  const views = await fetchJson<{ result: string[][] }>(`${host}/v2/query`, {
    method: 'post',
    body: {
      type: 'run_sql',
      args: {
        source,
        sql: `SELECT matviewname FROM pg_matviews WHERE schemaname = '${schema}';`,
        cascade: false,
        read_only: true,
      },
    },
    headers: {
      'x-hasura-admin-secret': secret,
    },
  });

  const viewNames = views.result.reduce<string[]>((state, value, i) => {
    if (i === 0) return state;
    state.push(value[0]);
    return state;
  }, []);

  const { result } = await fetchJson<{ result: string[][] }>(
    `${host}/v2/query`,
    {
      method: 'post',
      body: {
        type: 'run_sql',
        args: {
          source,
          sql: `
            SELECT a.attname,
                  t.relname,
                  pg_catalog.format_type(a.atttypid, a.atttypmod),
                  a.attnotnull
            FROM pg_attribute a
              JOIN pg_class t on a.attrelid = t.oid
              JOIN pg_namespace s on t.relnamespace = s.oid
            WHERE a.attnum > 0
              AND NOT a.attisdropped
              AND t.relname in (${viewNames
                .map((x) => `'${x}'`)
                .join(', ')}) --<< replace with the name of the MV
              AND s.nspname = 'public' --<< change to the schema your MV is in
            ORDER BY a.attnum;
          `,
          cascade: false,
          read_only: true,
        },
      },
      headers: {
        'x-hasura-admin-secret': secret,
      },
    }
  );

  return sqlColumnInfoToObject(result, 'relname');
}

export async function pushData(
  { host, secret, schema, source = defaultSource }: DBOptionsType,
  args: {
    tableName: string;
    customTableName: string;
    customRootFields: { [s: string]: string };
    customColumnNames: { [s: string]: string };
  }
) {
  await fetchJson(`${host}/v1/metadata`, {
    method: 'post',
    body: {
      type: 'pg_set_table_customization',
      args: {
        table: {
          schema,
          name: args.tableName,
        },
        source,
        configuration: {
          custom_root_fields: args.customRootFields,
          custom_name: args.customTableName,
          custom_column_names: args.customColumnNames,
        },
      },
    },
    headers: { 'x-hasura-admin-secret': secret },
  });
}

export async function pushRelationshipData(
  { host, secret, schema, source = defaultSource }: DBOptionsType,
  args: {
    tableName: string;
    oldName: string;
    newName: string;
  }
) {
  await fetchJson(`${host}/v1/metadata`, {
    method: 'post',
    body: {
      type: 'pg_rename_relationship',
      args: {
        table: {
          schema,
          name: args.tableName,
        },
        name: args.oldName,
        source,
        new_name: args.newName,
      },
    },
    headers: { 'x-hasura-admin-secret': secret },
  });
}

export async function getMetadata({
  host,
  secret,
}: DBOptionsType): Promise<MetadataType> {
  const data = await fetch(`${host}/v1/metadata`, {
    method: 'post',
    body: JSON.stringify({
      type: 'export_metadata',
      version: 2,
      args: {},
    }),
    headers: { 'x-hasura-admin-secret': secret },
  });
  return data.json();
}

async function fetchJson<Result>(
  url: string,
  options?: Omit<RequestInit, 'body'> & { body?: unknown }
) {
  const body =
    options?.body === undefined ? undefined : JSON.stringify(options.body);

  const result = await fetch(url, {
    ...options,
    body,
  });

  if (result.ok === false) {
    const { code, error: message } = await result
      .json()
      .catch((error) => ({ code: 'unknown', error: error?.message }));

    throw new HasuraError(message, code);
  }

  return result.json() as Promise<Result>;
}

class HasuraError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}
