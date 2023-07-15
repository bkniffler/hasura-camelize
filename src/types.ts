import type { Agent as AgentHttp } from 'http';
import type { Agent as AgentHttps } from 'https';

export interface DBOptionsType {
  host: string;
  secret: string;
  source?: string;
  schema?: string;
  agent?: AgentHttp | AgentHttps;
}

export type RootFieldsType = {
  select: string;
  select_by_pk: string;
  select_aggregate: string;
  select_stream: string;
  insert: string;
  insert_one: string;
  update: string;
  update_by_pk: string;
  update_many: string;
  delete: string;
  delete_by_pk: string;
};

export type TableNameConvertedType = {
  singular: string;
  plural: string;
};

export type MetadataType = {
  resource_version: number;
  metadata: {
    version: 3;
    sources: [
      {
        name: 'default' | string;
        kind: 'postgres';
        tables: {
          table: {
            schema: 'public' | string;
            name: string;
          };
          configuration: {
            // real: new
            custom_root_fields: {
              [s: string]: string;
            };
            custom_name: string;
            // real: new
            custom_column_names: {
              [s: string]: string;
            };
          };
          object_relationships: [
            {
              name: string;
              using: {
                foreign_key_constraint_on: string;
              };
            }
          ];
          array_relationships: [
            {
              name: string;
              using: {
                foreign_key_constraint_on: {
                  column: string;
                  table: {
                    schema: 'public';
                    name: string;
                  };
                };
              };
            }
          ];
        }[];
        configuration: {
          connection_info: {
            use_prepared_statements: boolean;
            database_url: {
              from_env: string;
            };
            isolation_level: 'read-committed';
            pool_settings: {
              connection_lifetime: number;
              retries: number;
              idle_timeout: number;
              max_connections: number;
            };
          };
        };
      }
    ];
  };
};
