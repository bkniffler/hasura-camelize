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

export function rootFieldTransformerDefault({
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

function c(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export function rootFieldTransformerInvert({
  plural,
  singular,
}: TableNameConvertedType): RootFieldsType {
  return {
    select: plural,
    select_by_pk: singular,
    select_aggregate: `aggregate${c(plural)}`,
    insert: `insert${c(plural)}`,
    insert_one: `insert${c(singular)}`,
    update: `update${c(plural)}`,
    update_by_pk: `update${c(singular)}`,
    delete: `delete${c(plural)}`,
    delete_by_pk: `delete${c(singular)}`,
  };
}
