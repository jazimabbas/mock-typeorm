import * as Sinon from "sinon";
import {
  DataSource,
  EntityManager,
  EntitySchema,
  Repository,
  SelectQueryBuilder,
} from "typeorm";
import { mockCreateQueryRunner } from "./helpers/mock-create-query-runner";
import {
  Constructor,
  MockHistory,
  MockState,
  SetMock,
} from "./type/mock-typeorm.types";
import { mockCreateQueryBuilder } from "./helpers/mock-create-query-builder";
import {
  queryBuilderReturnMethods,
  selfReferenceQueryBuilderMethods,
} from "./constants/query-builder";
import { mockMethod } from "./helpers/mock-method";
import { repositoryMethods } from "./constants/repository";
import {
  entityManagerModifyMethods,
  entityManagerQueryMethods,
} from "./constants/entity-manager";
import { dataSourceMethods } from "./constants/dataSource";
import { createClass, getDefinedMethods } from "./helpers/general";

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

    this.mockDataSouceMethods();
    this.mockCreateQueryRunner();
    this.mockCreateQueryBuilder();
    this.mockSelectQueryBuilderMethods();
    this.mockRepositoryMethods();
    this.mockEntityManagerMethods();
  }

  onMock(repository: string | Constructor<any>): SetMock {
    const self = this;
    const repositoryName =
      typeof repository === "string" ? repository : repository.name;

    return {
      toReturn(mockData: any, method = "find") {
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
      reset(method) {
        if (method) {
          if (self.mocks[repositoryName]) delete self.mocks[repositoryName][method];
          if (self.mockHistory[repositoryName])
            delete self.mockHistory[repositoryName][method];
          return;
        }

        delete self.mocks[repositoryName];
        delete self.mockHistory[repositoryName];
      },
    };
  }

  resetAll() {
    this.mocks = {};
    this.mockHistory = {};
  }

  restore() {
    Sinon.restore();
  }

  private mockDataSouceMethods() {
    const filteredDataSourceMethods = getDefinedMethods(
      DataSource.prototype,
      dataSourceMethods,
    );

    filteredDataSourceMethods.forEach((method) => {
      Sinon.stub(DataSource.prototype, method);
    });
  }

  private mockCreateQueryRunner() {
    if (DataSource.prototype.createQueryRunner) {
      Sinon.stub(DataSource.prototype, "createQueryRunner").callsFake(function (
        this: any,
      ) {
        return mockCreateQueryRunner.call(this);
      });
    }
  }

  private mockCreateQueryBuilder() {
    const self = this;

    if (DataSource.prototype.createQueryBuilder) {
      Sinon.stub(DataSource.prototype, "createQueryBuilder").callsFake(function (
        this: any,
        param: any,
      ): any {
        const repositoryName = self.getRepositoryName(param, param?.name);
        return mockCreateQueryBuilder.call(this, repositoryName);
      });
    }

    if (Repository.prototype.createQueryBuilder) {
      Sinon.stub(Repository.prototype, "createQueryBuilder").callsFake(function (
        this: any,
      ) {
        const repositoryName = self.getRepositoryName(
          this?.target,
          this?.target?.name,
        );
        return mockCreateQueryBuilder.call(this, repositoryName);
      });
    }
  }

  private mockSelectQueryBuilderMethods() {
    const self = this;

    const filteredSelfReferenceQueryBuilderMethods = getDefinedMethods(
      SelectQueryBuilder.prototype,
      selfReferenceQueryBuilderMethods,
    );
    const filteredQueryBuilderReturnMethods = getDefinedMethods(
      SelectQueryBuilder.prototype,
      queryBuilderReturnMethods,
    );

    filteredSelfReferenceQueryBuilderMethods.forEach((method) => {
      Sinon.stub(SelectQueryBuilder.prototype, method).callsFake(function (
        param: any,
      ) {
        const repositoryName = this.__repositoryName ?? param?.name;
        this.__repositoryName = repositoryName;
        return this;
      });
    });

    filteredQueryBuilderReturnMethods.forEach((method) => {
      Sinon.stub(SelectQueryBuilder.prototype, method).callsFake(async function () {
        const repositoryName = this.__repositoryName;
        return mockMethod(self, method, repositoryName);
      });
    });
  }

  private mockRepositoryMethods() {
    const self = this;

    const filteredRepositoryMethods = getDefinedMethods(
      Repository.prototype,
      repositoryMethods,
    );

    filteredRepositoryMethods.forEach((method) => {
      Sinon.stub(Repository.prototype, method).callsFake(async function (this: any) {
        const repositoryName = self.getRepositoryName(
          this?.target,
          this?.target?.name ?? "",
        );
        return mockMethod(self, method, repositoryName);
      });
    });
  }

  private mockEntityManagerMethods() {
    const self = this;

    const filteredEntityManagerQueryMethods = getDefinedMethods(
      EntityManager.prototype,
      entityManagerQueryMethods,
    );
    const filteredEntityManagerSavedMethods = getDefinedMethods(
      EntityManager.prototype,
      entityManagerModifyMethods,
    );

    const getRepositoryName = (param: any) => {
      let repositoryName = param.repositoryName ?? param?.constructor?.name;
      if (Array.isArray(param)) {
        const lastRecord = param[param.length - 1];
        repositoryName = lastRecord?.repositoryName ?? lastRecord?.constructor?.name;
      }
      return repositoryName;
    };

    filteredEntityManagerQueryMethods.forEach((method: any) => {
      Sinon.stub(EntityManager.prototype, method).callsFake(async function (
        this: any,
        param: any,
      ) {
        const repositoryName = self.getRepositoryName(param, param?.name);
        return mockMethod(self, method, repositoryName);
      });
    });

    filteredEntityManagerSavedMethods.forEach((method) => {
      Sinon.stub(EntityManager.prototype, method).callsFake(async function (
        param: any,
      ) {
        const repositoryName = getRepositoryName(param);
        if (!repositoryName) return {};

        return mockMethod(self, method, repositoryName);
      });
    });

    if (EntityManager.prototype.create) {
      Sinon.stub(EntityManager.prototype, "create").callsFake(function (
        Repository: any,
        params: any,
      ) {
        if (Repository instanceof EntitySchema) {
          Repository = createClass(Repository.options.name);
        } else if (typeof Repository === "string") {
          Repository = createClass(Repository);
        }

        const repository = new Repository();
        Object.keys(params).forEach((k) => {
          repository[k] = params[k];
        });
        return repository;
      });
    }

    if (EntityManager.prototype.transaction) {
      Sinon.stub(EntityManager.prototype, "transaction").callsFake(async function (
        isolationLevelOrCallback: any,
        callback: any,
      ) {
        const manager = this.connection.manager;

        if (typeof isolationLevelOrCallback === "string") {
          callback(manager);
        } else {
          isolationLevelOrCallback(manager);
        }
      });
    }
  }

  private getRepositoryName(repository: any, defaultRepositoryName: string) {
    let repositoryName: string;

    if (repository instanceof EntitySchema) {
      repositoryName = repository.options.name;
    } else if (typeof repository === "string") {
      repositoryName = repository;
    } else {
      repositoryName = defaultRepositoryName;
    }

    return repositoryName;
  }
}
