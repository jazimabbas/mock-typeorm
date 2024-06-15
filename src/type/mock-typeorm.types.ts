type MockHelper<T> = {
  [RepositoryName: string]: {
    [repositoryMethodName: string]: T;
  };
};

export type MockState = MockHelper<any>;

export type MockHistory = MockHelper<number>;

export interface Constructor<T> {
  new (...args: any[]): T;
}

export interface SetMock {
  toReturn(mockData: any, method: string): this;
}
