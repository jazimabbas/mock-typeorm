import Sinon, { SinonStub } from "sinon";
import { describe, expect, it, afterEach } from "vitest";
import { dataSource } from "./utils/mock";
import { MockTypeORM } from "../src/mock-typeorm";
import { queryRunnerMethods } from "../src/constants/query-runner";

describe("DataSource", () => {
  afterEach(() => {
    Sinon.restore();
  });

  describe("createQueryRunner()", () => {
    it.each(queryRunnerMethods)("should mock queryRunner method '%s'", async (method) => {
      new MockTypeORM();

      const queryRunner = dataSource.createQueryRunner();
      await (queryRunner[method] as any)();

      expect((queryRunner[method] as SinonStub).callCount).toEqual(1);
    });
  });
});
