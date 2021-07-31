import camelize from 'camelcase';
import pluralize from 'pluralize';

export type TableNameConvertedType = {
  singular: string;
  plural: string;
};

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
  return camelize(name);
}

export type RootFieldsType = {
  select: string;
  select_by_pk: string;
  select_aggregate: string;
  insert: string;
  insert_one: string;
  update: string;
  update_by_pk: string;
  delete: string;
  delete_by_pk: string;
};
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
