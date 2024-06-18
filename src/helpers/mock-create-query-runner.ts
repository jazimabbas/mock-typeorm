import * as Sinon from "sinon";
import { queryRunnerMethods } from "../constants/query-runner";

export function mockCreateQueryRunner(this: any) {
  const queryRunner: any = {};

  queryRunnerMethods.forEach((method) => {
    (queryRunner as any)[method] = Sinon.stub();
  });
  queryRunner.manager = this.manager;

  return queryRunner as any;
}
