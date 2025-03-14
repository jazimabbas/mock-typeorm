import { EntityManagerSetMockMethods } from "../constants/entity-manager";
import {
  QueryBuilderMethods,
  QueryBuilderReturnMethods,
  RepositoryMethods,
  SelfReferenceQueryBuilderMethods,
} from "./typeorm.types";

type MockHelper<T> = {
  [RepositoryName: string]: {
    [repositoryMethodName: string]: T;
  };
};

export type MockState = MockHelper<any>;

export type MockHistory = MockHelper<number>;

export type Methods =
  | EntityManagerSetMockMethods
  | QueryBuilderReturnMethods
  | SelfReferenceQueryBuilderMethods
  | RepositoryMethods
  | QueryBuilderMethods;

export interface Constructor<T> {
  new (...args: any[]): T;
}

export interface SetMock {
  toReturn(mockData: any, method?: Methods): this;
  reset(method?: Methods): void;
}
