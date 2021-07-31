import fetch from 'node-fetch';

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
  const column_names_resp = await fetch(`${host}/v2/query`, {
    method: 'post',
    body: JSON.stringify({
      type: 'run_sql',
      args: {
        source,
        sql: `SELECT column_name, table_name, is_generated, is_identity, identity_generation FROM information_schema.columns where table_schema = '${schema}';`,
        cascade: false,
        read_only: true,
      },
    }),
    headers: {
      'x-hasura-admin-secret': secret,
    },
  });
  const json = await column_names_resp.json();
  const result = json.result as string[][];
  if (!result) {
    throw new Error(
      'Unexpected response, please check that host/secret are correct'
    );
  }
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
  { host, secret, source = defaultSource }: DBOptionsType,
  args: {
    tableName: string;
    customTableName: string;
    customRootFields: { [s: string]: string };
    customColumnNames: { [s: string]: string };
  }
) {
  await fetch(`${host}/v1/metadata`, {
    method: 'post',
    body: JSON.stringify({
      type: 'pg_set_table_customization',
      args: {
        table: args.tableName,
        source,
        configuration: {
          custom_root_fields: args.customRootFields,
          custom_name: args.customTableName,
          custom_column_names: args.customColumnNames,
        },
      },
    }),
    headers: { 'x-hasura-admin-secret': secret },
  });
}
