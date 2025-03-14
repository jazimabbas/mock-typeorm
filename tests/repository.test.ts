import Sinon from "sinon";
import { describe, afterEach, it, expect } from "vitest";
import { MockTypeORM } from "../src";
import { dataSource, Role, UserEntitySchema } from "./utils/mock";
import { mockRepositoryMethods } from "./utils/data";

describe("Repository", () => {
  afterEach(() => {
    Sinon.restore();
  });

  describe("repository methods", () => {
    it.each(mockRepositoryMethods)(
      "should mock repository method $methodLabel with correct return data",
      async ({ method, mockData }) => {
        const typeorm = new MockTypeORM();
        typeorm.onMock(Role).toReturn(mockData, method as any);

        const roleRepository = dataSource.getRepository(Role);
        const result = await roleRepository[method as any]();

        expect(result).toEqual(mockData);
      },
    );
  });

  describe("calling the same repository method multiple times in a same function", () => {
    it("should return different data when we call same methods in one function", async () => {
      const typeorm = new MockTypeORM();
      typeorm.onMock(Role).toReturn(["role1"], "find").toReturn(["role2"], "find");

      const roleRepository = dataSource.getRepository(Role);
      const roles = await roleRepository.find();
      const newRoles = await roleRepository.find();

      expect(roles).toEqual(["role1"]);
      expect(newRoles).toEqual(["role2"]);
    });

    // ISSUE: https://github.com/jazimabbas/mock-typeorm/issues/4
    it("should return null if we mock the function by providing the null value", async () => {
      const typeorm = new MockTypeORM();
      typeorm
        .onMock(Role)
        .toReturn(null, "findOne")
        .toReturn({ id: "1" }, "findOne")
        .toReturn(null, "findOne");

      const roleRepository = dataSource.getRepository(Role);
      const role1 = await roleRepository.findOne({});
      const role2 = await roleRepository.findOne({});
      const role3 = await roleRepository.findOne({});

      expect(role1).toBeNull();
      expect(role2).toEqual({ id: "1" });
      expect(role3).toBeNull();
    });
  });

  it("should throw an error if mock method throws an error", async () => {
    const typeorm = new MockTypeORM();
    typeorm.onMock(Role).toReturn(new Error("Something failed"), "find");

    const roleRepository = dataSource.getRepository(Role);

    await expect(roleRepository.find({})).rejects.toThrowError(/failed/i);
  });

  describe("create() without awaiting", () => {
    it("should create a role with the correct data without awaiting", () => {
      const typeorm = new MockTypeORM();
      const mockRole = { name: "role", isAdmin: true };
      typeorm.onMock(Role).toReturn(mockRole, "create");

      const roleRepository = dataSource.getRepository(Role);
      const role = roleRepository.create({ name: "role1" });

      expect(role).toEqual(mockRole);
    });

    it("should create and save a role with the correct data", async () => {
      const typeorm = new MockTypeORM();
      const mockRole = { name: "role", isAdmin: true };
      typeorm
        .onMock(Role)
        .toReturn(mockRole, "create")
        .toReturn({ id: "1", ...mockRole }, "save");

      const roleRepository = dataSource.getRepository(Role);
      const role = roleRepository.create({ name: "role1" });
      const savedRole = await roleRepository.save(role);

      expect(role).toEqual(mockRole);
      expect(savedRole).toEqual({ id: "1", ...mockRole });
    });
  });

  describe("EntitySchema", () => {
    it("should return correct payload when passing EntitySchema as a class", async () => {
      const typeorm = new MockTypeORM();
      const mockUsers = [{ id: "1", name: "a" }];
      typeorm.onMock("UserEntitySchema").toReturn(mockUsers, "find");

      const users = await dataSource.getRepository(UserEntitySchema).find();

      expect(users).toEqual(mockUsers);
    });
  });

  describe("EntityManager", () => {
    it("should return correct data when we use getRepository of EntityManager", async () => {
      const mockRoles = { name: "role" };
      const typeorm = new MockTypeORM();
      typeorm.onMock(Role).toReturn(mockRoles, "findOne");

      const roleRepository = dataSource.manager.getRepository(Role);
      const roles = await roleRepository.findOne({});

      expect(roles).toEqual(mockRoles);
    });
  });
});
