import Sinon, { SinonStub } from "sinon";
import { describe, expect, it, afterEach } from "vitest";
import { dataSource, Role } from "./utils/mock";
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

  describe("createQueryBuilder()", () => {
    describe.each([
      {
        testSuiteLabel: "DataSource.createQueryBuilder()",
        setup: () => {
          return {
            queryBuilder: dataSource.createQueryBuilder(Role, "role"),
          };
        },
      },
      {
        testSuiteLabel: "Repository.createQueryBuilder()",
        setup: () => {
          return {
            queryBuilder: dataSource.getRepository(Role).createQueryBuilder("role"),
          };
        },
      },
      {
        testSuiteLabel: "DataSource.manager.createQueryBuilder()",
        setup: () => {
          return {
            queryBuilder: dataSource.manager.createQueryBuilder(Role, "role"),
          };
        },
      },
    ])("$testSuiteLabel", ({ setup }) => {
      it("should return the correct role", async () => {
        const typeorm = new MockTypeORM();
        typeorm.onMock(Role).toReturn("role", "getOne");

        const { queryBuilder } = setup();
        const role = await queryBuilder.where("user.id = 1").select().getOne();

        expect(role).toEqual("role");
        expect((queryBuilder.where as SinonStub).callCount).toEqual(1);
        expect((queryBuilder.select as SinonStub).callCount).toEqual(1);
        expect((queryBuilder.getOne as SinonStub).callCount).toEqual(1);
        expect((queryBuilder.getMany as SinonStub).callCount).toEqual(0); // just to test if we call this method or not
      });

      it("should return the empty role if we didn't mock the method e.g. getOne() | getMany() etc..", async () => {
        new MockTypeORM();

        const { queryBuilder } = setup();
        const role = await queryBuilder.where("user.id = 1").select().getOne();

        expect(role).toEqual({});
        expect((queryBuilder.where as SinonStub).callCount).toEqual(1);
        expect((queryBuilder.select as SinonStub).callCount).toEqual(1);
        expect((queryBuilder.getOne as SinonStub).callCount).toEqual(1);
        expect((queryBuilder.getMany as SinonStub).callCount).toEqual(0); // just to test if we call this method or not
      });

      it("should throw an error if mock method throws an error", async () => {
        const typeorm = new MockTypeORM();
        typeorm.onMock(Role).toReturn(new Error("Something failed"), "getOne");

        const { queryBuilder } = setup();

        await expect(queryBuilder.where("user.id = 1").select().getOne()).rejects.toThrowError(
          /failed/i
        );
        expect((queryBuilder.where as SinonStub).callCount).toEqual(1);
        expect((queryBuilder.select as SinonStub).callCount).toEqual(1);
        expect((queryBuilder.getOne as SinonStub).callCount).toEqual(1);
        expect((queryBuilder.getMany as SinonStub).callCount).toEqual(0); // just to test if we call this method or not
      });
    });
  });

  describe("transaction", () => {
    it("should run method inside transaction", async () => {
      const mockRoles = ["role"];
      const typeorm = new MockTypeORM();
      typeorm.onMock(Role).toReturn(mockRoles, "find");

      let roles: any;
      await dataSource.transaction(async (manager) => {
        roles = await manager.find(Role, {});
      });

      expect(roles).toEqual(mockRoles);
    });

    it("should run method inside transaction with isolation level passed in", async () => {
      const mockRoles = ["role1"];
      const typeorm = new MockTypeORM();
      typeorm.onMock(Role).toReturn(mockRoles, "find");

      let roles: any;
      await dataSource.manager.transaction("READ COMMITTED", async (manager) => {
        roles = await manager.find(Role, {});
      });

      expect(roles).toEqual(mockRoles);
    });
  });
});
