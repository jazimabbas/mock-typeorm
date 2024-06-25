import * as Sinon from "sinon";
import { queryRunnerMethods } from "../constants/query-runner";
import { MockTypeORM } from "../mock-typeorm";

export function mockCreateQueryRunner(this: any, mockTypeORM: MockTypeORM) {
  const queryRunner: any = {};

  if (!mockTypeORM.__internal?.queryRunner) {
    queryRunnerMethods.forEach((method) => {
      (queryRunner as any)[method] = Sinon.stub();
    });
    queryRunner.manager = this.manager;
    mockTypeORM.__internal.queryRunner = queryRunner;
  }

  return mockTypeORM.__internal.queryRunner as any;
}
