import { RootFieldsType, TableNameConvertedType } from './types';
import camelize from 'camelcase';
import pluralize from 'pluralize';

export function tableNameTransformer(name: string): TableNameConvertedType {
  const tableName = camelize(name);
  const plural = pluralize.plural(tableName);
  const singular = pluralize.singular(tableName);
  return {
    plural,
    singular,
  };
}

export function columnNameTransformer(name: string): string {
  // Hasura converts '?' to '_' by default
  return camelize(name).replace(/[?]/g, '_');
}

export function rootFieldTransformer({
  plural,
  singular,
}: TableNameConvertedType): RootFieldsType {
  return {
    select: plural,
    select_by_pk: singular,
    select_aggregate: `${plural}Aggregate`,
    insert: `${plural}Insert`,
    insert_one: `${singular}Insert`,
    update: `${plural}Update`,
    update_by_pk: `${singular}Update`,
    delete: `${plural}Delete`,
    delete_by_pk: `${singular}Delete`,
  };
}
