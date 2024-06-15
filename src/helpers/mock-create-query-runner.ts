import * as Sinon from "sinon";
import { DataSource } from "typeorm";

export function mockCreateQueryRunner(
  this: any,
  originalCreateQueryRunner: DataSource["createQueryRunner"]
) {
  const queryRunner = originalCreateQueryRunner.apply(this);
  const allQueryRunnerMethodKeys = Object.keys(queryRunner).filter(
    (k) => typeof (queryRunner as any)[k] === "function"
  );

  allQueryRunnerMethodKeys.forEach((method) => {
    (queryRunner as any)[method] = Sinon.stub();
  });

  return queryRunner;
}
