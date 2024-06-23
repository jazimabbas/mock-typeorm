import { EntityManager } from "typeorm";

type AllEntityManagerMethodObj = {
  [K in keyof EntityManager as EntityManager[K] extends (...args: any[]) => any
    ? K
    : never]: K;
};

export type EntityManagerSetMockMethods = keyof Omit<
  AllEntityManagerMethodObj,
  | "createQueryBuilder"
  | "getRepository"
  | "getTreeRepository"
  | "getMongoRepository"
  | "withRepository"
  | "getCustomRepository"
  | "hasId"
  | "getId"
  | "create"
  | "merge"
  | "transaction"
>;

export const entityManagerQueryMethods: EntityManagerSetMockMethods[] = [
  "average",
  "clear",
  "count",
  "countBy",
  "decrement",
  "delete",
  "exists",
  "existsBy",
  "find",
  "findAndCount",
  "findAndCountBy",
  "findBy",
  "findByIds",
  "findOne",
  "findOneBy",
  "findOneById",
  "findOneByOrFail",
  "findOneOrFail",
  "increment",
  "insert",
  "maximum",
  "minimum",
  "preload",
  "query",
  "release",
  "restore",
  "softDelete",
  "sum",
  "update",
  "upsert",
];

export const entityManagerModifyMethods: EntityManagerSetMockMethods[] = [
  "save",
  "remove",
  "softRemove",
  "recover",
];
