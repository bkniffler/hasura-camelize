import { MetadataType } from './types';
import fetch, { RequestInit } from 'node-fetch';

const defaultSource = 'default';
const defaultSchema = 'public';

export interface DBOptionsType {
  host: string;
  secret: string;
  source?: string;
  schema?: string;
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
  const data = result.reduce<{ [s: string]: string[] }>((state, value) => {
    if (value[1] !== 'table_name') {
      const fieldName = value[0];
      const tableName = value[1];
      if (!state[tableName]) {
        state[tableName] = [];
      }
      state[tableName].push(fieldName);
    }
    return state;
  }, {});
  return data;
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
