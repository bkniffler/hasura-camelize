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
