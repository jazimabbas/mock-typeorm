import { DataSource } from "typeorm";
import { describe, afterEach, it, expect } from "vitest";
import Sinon, { SinonStub } from "sinon";
import { dataSource, Role, UserEntitySchema } from "./utils/mock";
import { MockTypeORM } from "../src";
import { queryRunnerMethods } from "../src/constants/query-runner";
import { DataSourceMethods } from "../src/constants/dataSource";

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

    it("should return correct payload with manager methods", async () => {
      const mockRole = { id: "1", name: "a" };
      const typeorm = new MockTypeORM();
      typeorm.onMock(Role).toReturn(mockRole, "findOne");

      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const role = await queryRunner.manager.findOne(Role, { where: {} });
      await queryRunner.commitTransaction();
      await queryRunner.release();

      expect(true).toBeTruthy();
      expect(role).toEqual(mockRole);
    });

    describe("EntitySchema", () => {
      it("should mock method when passing EntitySchema as a class", async () => {
        const typeorm = new MockTypeORM();
        const mockUser = { id: "1", name: "a" };
        typeorm.onMock("UserEntitySchema").toReturn(mockUser, "findOne");

        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const user = await queryRunner.manager.findOne(UserEntitySchema as any, { where: {} });
        await queryRunner.commitTransaction();
        await queryRunner.release();

        expect(user).toEqual(mockUser);
      });

      it("should mock method when passing EntitySchema as a string", async () => {
        const typeorm = new MockTypeORM();
        const mockUser = { id: "1", name: "a" };
        typeorm.onMock("UserEntitySchema").toReturn(mockUser, "findOne");

        const queryRunner = dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const user = await queryRunner.manager.findOne("UserEntitySchema" as any, { where: {} });
        await queryRunner.commitTransaction();
        await queryRunner.release();

        expect(user).toEqual(mockUser);
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

    describe("callback", () => {
      it("should return correct payload when using callback inside transaction", async () => {
        const mockRoles = ["role"];
        const typeorm = new MockTypeORM();
        typeorm.onMock(Role).toReturn(mockRoles, "find");

        let roles: any;
        await dataSource.manager.transaction(async (manager) => {
          roles = await manager.find(Role, {});
        });

        expect(roles).toEqual(mockRoles);
      });

      it("should return correct payload when using callback inside transaction with isolation level passed in", async () => {
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

  describe("methods", () => {
    const methods: { method: DataSourceMethods; setup: any }[] = [
      { method: "initialize", setup: () => dataSource.initialize() },
      { method: "destroy", setup: () => dataSource.destroy() },
      { method: "dropDatabase", setup: () => dataSource.dropDatabase() },
      { method: "runMigrations", setup: () => dataSource.runMigrations() },
      { method: "showMigrations", setup: () => dataSource.showMigrations() },
      { method: "synchronize", setup: () => dataSource.synchronize() },
      { method: "undoLastMigration", setup: () => dataSource.undoLastMigration() },
    ];

    it.each(methods)("should mock $method", async ({ method, setup }) => {
      new MockTypeORM();

      await setup();

      expect((DataSource.prototype[method] as SinonStub).callCount).toEqual(1);
    });
  });
});
