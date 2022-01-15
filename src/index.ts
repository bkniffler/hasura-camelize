import * as api from './api';
import * as defaults from './defaults';
export { defaultSchema, defaultSource } from './api';

export type OptionalResultType<T> = T | undefined | false;

export async function hasuraCamelize(
  dbOptions: api.DBOptionsType,
  {
    dry = false,
    relations = false,
    transformTableNames = defaults.tableNameTransformer,
    getRootFieldNames = defaults.rootFieldTransformer,
    transformColumnNames = defaults.columnNameTransformer,
  }: {
    dry?: boolean;
    relations?: boolean;
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

  console.log('--- Settings ---');
  for (const key in dbOptions) {
    let value = dbOptions[key] || '<none>';
    if (key === 'secret' && dbOptions[key]) value = '<secret>';
    console.log(`${key}: ${value}`);
  }
  console.log(`dry: ${dry}`);
  console.log(`relations: ${dry}`);

  console.log('\n--- Starting ---');
  const meta = await api.getMetadata(dbOptions);
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
      `${tableName} -> ${tableNames.singular} / ${tableNames.plural}`
    );
    for (const key in customRootFields)
      console.log(`  ${key}: ${customRootFields[key]}`);
    console.log(`columns`);
    for (const key in customColumnNames)
      console.log(`  ${key}: ${customColumnNames[key]}`);

    if (!dry) {
      await api.pushData(dbOptions, {
        tableName,
        customColumnNames,
        customRootFields,
        customTableName: tableNames.singular,
      });
    }
  }
  if (relations) {
    for (const source of meta.metadata.sources) {
      for (const table of source.tables) {
        if (table.array_relationships)
          for (const rel of table.array_relationships) {
            const newName = transformColumnNames(
              rel.name,
              table.table.name,
              defaults.columnNameTransformer
            );
            if (rel.name !== newName && newName) {
              console.log(`${rel.name} => ${newName}`);
              if (!dry) {
                await api.pushRelationshipData(dbOptions, {
                  tableName: table.table.name,
                  newName,
                  oldName: rel.name,
                });
              }
            }
          }
        if (table.object_relationships)
          for (const rel of table.object_relationships) {
            const newName = transformColumnNames(
              rel.name,
              table.table.name,
              defaults.columnNameTransformer
            );
            if (rel.name !== newName && newName) {
              console.log(`${rel.name} => ${newName}`);
              if (!dry) {
                await api.pushRelationshipData(dbOptions, {
                  tableName: table.table.name,
                  newName,
                  oldName: rel.name,
                });
              }
            }
          }
      }
    }
  }
}

export default hasuraCamelize;
