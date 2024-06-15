import * as Sinon from "sinon";
import { DataSource } from "typeorm";
import { mockCreateQueryRunner } from "./helpers/mock-create-query-runner";
import { Constructor, MockHistory, MockState, SetMock } from "./type/mock-typeorm.types";

export class MockTypeORM {
  private mocks: MockState;
  private mockHistory: MockHistory;

  constructor() {
    this.mocks = {};
    this.mockHistory = {};

    Sinon.stub(DataSource.prototype, "createQueryRunner").callsFake(function (this: any) {
      return mockCreateQueryRunner.call(this);
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
