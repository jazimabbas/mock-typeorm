import { EntityManagerSetMockMethods } from "../constants/entity-manager";
import {
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
  | RepositoryMethods;

export interface Constructor<T> {
  new (...args: any[]): T;
}

export interface SetMock {
  toReturn(mockData: any, method: Methods): this;
}
