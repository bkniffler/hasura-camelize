import * as api from './api';
import * as defaults from './defaults';
import { DBOptionsType, RootFieldsType, TableNameConvertedType } from './types';
export { defaultSchema, defaultSource } from './api';

export type OptionalResultType<T> = T | undefined | false;

export async function hasuraCamelize(
  dbOptions: DBOptionsType,
  {
    dry = false,
    relations = false,
    pattern = 'default',
    pgMaterializedViews = false,
    transformTableNames = defaults.tableNameTransformer,
    getRootFieldNames,
    transformColumnNames = defaults.columnNameTransformer,
  }: {
    dry?: boolean;
    relations?: boolean;
    pattern?: 'invert' | 'default';
    pgMaterializedViews?: boolean;
    transformTableNames?: (
      name: string,
      defaultTransformer: typeof defaults.tableNameTransformer
    ) => OptionalResultType<TableNameConvertedType>;
    transformColumnNames?: (
      name: string,
      tableName: string,
      defaultTransformer: typeof defaults.columnNameTransformer
    ) => OptionalResultType<string>;
    getRootFieldNames?: (
      name: TableNameConvertedType,
      defaultTransformer: typeof defaults.rootFieldTransformerDefault
    ) => RootFieldsType;
  }
) {
  const defaultRootFieldNames =
    pattern === 'invert'
      ? defaults.rootFieldTransformerInvert
      : defaults.rootFieldTransformerDefault;
  if (!getRootFieldNames) getRootFieldNames = defaultRootFieldNames;
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

  if (pgMaterializedViews) {
    const materializedViews = await api.fetchPGMaterializedViewData(dbOptions);
    for (const key in materializedViews) {
      data[key] = materializedViews[key];
    }
  }

  for (const tableName in data) {
    const tableNames = transformTableNames(
      tableName,
      defaults.tableNameTransformer
    );
    if (!tableNames) continue;
    const customRootFields = getRootFieldNames(
      tableNames,
      defaultRootFieldNames
    );

    const customColumnNames = data[tableName].reduce((state, value) => {
      const columnName = transformColumnNames(
        value,
        tableName,
        defaults.columnNameTransformer
      );
      if (columnName !== value && columnName) {
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
                await api.pushRelationshipData(Object.assign({}, dbOptions, {schema: table.table.schema}), {
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
                await api.pushRelationshipData(Object.assign({}, dbOptions, {schema: table.table.schema}), {
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
