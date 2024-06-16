import * as Sinon from "sinon";
import { DataSource, SelectQueryBuilder } from "typeorm";
import { mockCreateQueryRunner } from "./helpers/mock-create-query-runner";
import { Constructor, MockHistory, MockState, SetMock } from "./type/mock-typeorm.types";
import { mockCreateQueryBuilder } from "./helpers/mock-create-query-builder";
import {
  queryBuilderReturnMethods,
  selfReferenceQueryBuilderMethods,
} from "./constants/query-builder";

export class MockTypeORM {
  private mocks: MockState;
  private mockHistory: MockHistory;

  constructor() {
    this.mocks = {};
    this.mockHistory = {};

    const self = this;

    Sinon.stub(DataSource.prototype, "createQueryRunner").callsFake(function (this: any) {
      return mockCreateQueryRunner.call(this);
    });

    Sinon.stub(DataSource.prototype, "createQueryBuilder").callsFake(function (
      this: any,
      param: any
    ): any {
      const repositoryName = param.name;
      return mockCreateQueryBuilder.call(this, repositoryName);
    });

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
        if (!repositoryName) return {};

        const repoMocks = self.mocks[repositoryName];
        if (!repoMocks) return {};

        const repoMethodMocks = repoMocks[method];
        if (!repoMethodMocks) return {};

        const mockDataExtractedFrom = self.mockHistory[repositoryName][method];
        ++self.mockHistory[repositoryName][method];

        const mockData =
          self.mocks[repositoryName][method][mockDataExtractedFrom] ??
          self.mocks[repositoryName][method][0];
        if (!mockData) return {};

        if (mockData instanceof Error) throw mockData;
        return mockData;
      } as any);
    });
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
}
