import * as Sinon from "sinon";
import { queryRunnerMethods } from "../constants/query-runner";

export function mockCreateQueryRunner(this: any) {
  const queryRunner = {};

  queryRunnerMethods.forEach((method) => {
    (queryRunner as any)[method] = Sinon.stub();
  });

  return queryRunner as any;
}
