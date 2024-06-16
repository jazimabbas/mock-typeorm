import * as Sinon from "sinon";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { mockCreateQueryRunner } from "./helpers/mock-create-query-runner";
import { Constructor, MockHistory, MockState, SetMock } from "./type/mock-typeorm.types";
import { mockCreateQueryBuilder } from "./helpers/mock-create-query-builder";
import {
  queryBuilderReturnMethods,
  selfReferenceQueryBuilderMethods,
} from "./constants/query-builder";
import { mockMethod } from "./helpers/mock-method";
import { repositoryMethods } from "./constants/repository";

export class MockTypeORM {
  private _mocks: MockState;
  private _mockHistory: MockHistory;

  public get mocks(): MockState {
    return this._mocks;
  }

  public set mocks(value: MockState) {
    this._mocks = value;
  }

  public get mockHistory(): MockHistory {
    return this._mockHistory;
  }
  public set mockHistory(value: MockHistory) {
    this._mockHistory = value;
  }

  constructor() {
    this.mocks = {};
    this.mockHistory = {};

    Sinon.stub(DataSource.prototype, "createQueryRunner").callsFake(function (this: any) {
      return mockCreateQueryRunner.call(this);
    });

    this.mockCreateQueryBuilder();
    this.mockSelectQueryBuilderMethods();
    this.mockRepositoryMethods();
  }

  onMock(repository: string | Constructor<any>): SetMock {
    const self = this;
    const repositoryName = typeof repository === "string" ? repository : repository.name;

    return {
      toReturn(mockData: any, method: string = "find") {
        if (!self.mocks[repositoryName]) {
          self.mocks[repositoryName] = {};
        }

        const mockMethod = self.mocks[repositoryName][method];
        if (mockMethod) {
          const totalMockItemsFoundInMethod = Object.keys(mockMethod).length;
          mockMethod[totalMockItemsFoundInMethod] = mockData;
        } else {
          self.mocks[repositoryName] = { [method]: { 0: mockData } };

          // initialize mock history with empty state
          if (!self.mockHistory[repositoryName]) {
            self.mockHistory = { ...self.mockHistory, [repositoryName]: {} };
          }
          self.mockHistory[repositoryName] = { [method]: 0 };
        }

        return this;
      },
    };
  }

  private mockCreateQueryBuilder() {
    Sinon.stub(DataSource.prototype, "createQueryBuilder").callsFake(function (
      this: any,
      param: any
    ): any {
      const repositoryName = param.name;
      return mockCreateQueryBuilder.call(this, repositoryName);
    });

    Sinon.stub(Repository.prototype, "createQueryBuilder").callsFake(function (this: any) {
      const repositoryName = this.target.name;
      return mockCreateQueryBuilder.call(this, repositoryName);
    });
  }

  private mockSelectQueryBuilderMethods() {
    const self = this;

    selfReferenceQueryBuilderMethods.forEach((method) => {
      Sinon.stub(SelectQueryBuilder.prototype, method).callsFake(function (param: any) {
        const repositoryName = this.__repositoryName ?? param.name;
        this.__repositoryName = repositoryName;
        return this;
      });
    });

    queryBuilderReturnMethods.forEach((method) => {
      Sinon.stub(SelectQueryBuilder.prototype, method).callsFake(async function () {
        const repositoryName = this.__repositoryName;
        return mockMethod(self, method, repositoryName);
      });
    });
  }

  private mockRepositoryMethods() {
    const self = this;

    repositoryMethods.forEach((method) => {
      Sinon.stub(Repository.prototype, method).callsFake(async function (this: any) {
        const repositoryName = this.target?.name ?? "";
        return mockMethod(self, method, repositoryName);
      });
    });
  }
}
