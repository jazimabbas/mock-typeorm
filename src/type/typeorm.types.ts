import { Repository, SelectQueryBuilder } from "typeorm";

type SelectQueryBuilderMethodObj = {
  [K in keyof SelectQueryBuilder<any> as SelectQueryBuilder<any>[K] extends (
    ...args: any[]
  ) => any
    ? K
    : never]: SelectQueryBuilder<any>[K];
};

type FilterMethods<T> = {
  [K in keyof SelectQueryBuilderMethodObj as SelectQueryBuilderMethodObj[K] extends (
    ...args: any[]
  ) => T
    ? K
    : never]: SelectQueryBuilderMethodObj[K];
};

type ExtractMethodNames<T> = keyof T;

export type SelfReferenceQueryBuilderMethods = Exclude<
  ExtractMethodNames<FilterMethods<SelectQueryBuilder<any>>>,
  "createQueryBuilder"
>;

export type QueryBuilderReturnMethods = ExtractMethodNames<
  FilterMethods<Promise<any>>
>;

type AllRepositoryMethods = {
  [K in keyof Repository<any>]: K;
}[keyof Repository<any>];

export type RepositoryMethods = Exclude<AllRepositoryMethods, "createQueryBuilder">;
