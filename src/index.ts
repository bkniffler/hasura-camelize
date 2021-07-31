import * as api from './api';
import * as defaults from './defaults';

export type OptionalResultType<T> = T | undefined | false;

export async function hasuraCamelize(
  dbOptions: api.DBOptionsType,
  {
    dry = false,
    transformTableNames = defaults.tableNameTransformer,
    getRootFieldNames = defaults.rootFieldTransformer,
    transformColumnNames = defaults.columnNameTransformer,
  }: {
    dry?: boolean;
    transformTableNames?: (
      name: string,
      defaultTransformer: typeof defaults.tableNameTransformer
    ) => OptionalResultType<defaults.TableNameConvertedType>;
    transformColumnNames?: (
      name: string,
      tableName: string,
      defaultTransformer: typeof defaults.columnNameTransformer
    ) => OptionalResultType<string>;
    getRootFieldNames?: (
      name: defaults.TableNameConvertedType,
      defaultTransformer: typeof defaults.rootFieldTransformer
    ) => defaults.RootFieldsType;
  }
) {
  if (!dbOptions.host) throw new Error('No host provided');
  const data = await api.fetchData(dbOptions);

  for (const tableName in data) {
    const tableNames = transformTableNames(
      tableName,
      defaults.tableNameTransformer
    );
    if (!tableNames) continue;
    const customRootFields = getRootFieldNames(
      tableNames,
      defaults.rootFieldTransformer
    );

    const customColumnNames = data[tableName].reduce((state, value) => {
      const columnName = transformColumnNames(
        value,
        tableName,
        defaults.columnNameTransformer
      );
      if (columnName) {
        state[value] = columnName;
      }
      return state;
    }, {});

    console.log(
      JSON.stringify(
        {
          table: tableName,
          tableNames,
          columns: customColumnNames,
          rootFields: customRootFields,
        },
        null,
        2
      )
    );

    if (!dry) {
      await api.pushData(dbOptions, {
        tableName,
        customColumnNames,
        customRootFields,
        customTableName: tableNames.singular,
      });
    }
  }
}

export default hasuraCamelize;
