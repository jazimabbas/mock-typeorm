import Sinon from "sinon";
import { describe, afterEach, it, expect } from "vitest";
import { MockTypeORM } from "../src";
import { dataSource, Role, User } from "./utils/mock";
import {
  entityManagerModifyMethods,
  entityManagerQueryMethods,
} from "../src/constants/entity-manager";

describe("EntityManager", () => {
  afterEach(() => {
    Sinon.restore();
  });

  describe("single method", () => {
    it("should return mock data when we call EntityManager method", async () => {
      const typeorm = new MockTypeORM();
      typeorm.onMock(Role).toReturn(["role"], "findOne");

      const role = await dataSource.manager.findOne(Role, {});

      expect(role).toEqual(["role"]);
    });

    it("should return empty object when we call EntityManager method and we didn't mock that method", async () => {
      new MockTypeORM();

      const role = await dataSource.manager.findOne(Role, {});

      expect(role).toEqual({});
    });
  });

  describe("modify methods", () => {
    describe.each(entityManagerModifyMethods)("%s", (method: any) => {
      it(`should ${method} an entity`, async () => {
        const typeorm = new MockTypeORM();
        const mockRole = { id: "newId", name: "a" };
        typeorm.onMock(Role).toReturn(mockRole, method);

        const role = dataSource.manager.create(Role, mockRole);
        const newRole = await dataSource.manager[method](role);

        expect(newRole).toEqual(mockRole);
      });

      it(`should ${method} multiple entities at the same time`, async () => {
        const typeorm = new MockTypeORM();
        const mockRole = { id: "newId", name: "b" };
        typeorm.onMock(Role).toReturn(mockRole, method);

        const role = dataSource.manager.create(Role, { id: "1", name: "a" });
        const user = dataSource.manager.create(User, { id: "1", name: "a" });
        const newRole = await dataSource.manager[method]([user, role]);

        expect(newRole).toEqual(mockRole);
      });
    });
  });

  describe("query methods", () => {
    it.each(entityManagerQueryMethods)(
      "should return correct payload when we mock the method '%s'",
      async (method: any) => {
        const typeorm = new MockTypeORM();
        typeorm.onMock(Role).toReturn(["role"], method);

        const role = await dataSource.manager[method](Role, {});

        expect(role).toEqual(["role"]);
      }
    );
  });

  describe("getRepository()", () => {
    it("should return correct data when we use getRepository of EntityManager", async () => {
      const mockRoles = { name: "role" };
      const typeorm = new MockTypeORM();
      typeorm.onMock(Role).toReturn(mockRoles, "findOne");

      const roleRepository = dataSource.manager.getRepository(Role);
      const roles = await roleRepository.findOne({});

      expect(roles).toEqual(mockRoles);
    });
  });

  describe("transaction()", () => {
    it("should run method inside transaction", async () => {
      const mockRoles = ["role"];
      const typeorm = new MockTypeORM();
      typeorm.onMock(Role).toReturn(mockRoles, "find");

      let roles: any;
      await dataSource.manager.transaction(async (manager) => {
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
