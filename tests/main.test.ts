import Sinon from "sinon";
import { beforeEach, describe, expect, it, afterEach, afterAll, beforeAll } from "vitest";
import { MockTypeORM } from "../src";
import { dataSource, Role, User, UserEntitySchema } from "./utils/mock";

describe("Main", () => {
  let typeorm: MockTypeORM;

  beforeAll(() => {
    typeorm = new MockTypeORM();
  });

  afterEach(() => {
    typeorm.resetAll();
  });

  afterAll(() => {
    typeorm.restore();
  });

  it("should reset the mock for a single method we just set", async () => {
    typeorm.onMock(Role).toReturn({ id: "1", name: "a" }, "findOne").reset("findOne");

    const role = await dataSource.getRepository(Role).findOne({});

    expect(role).toEqual({});
  });

  it("should reset the mock for all the methods for a given Repository", async () => {
    typeorm
      .onMock(Role)
      .toReturn({ id: "1", name: "a" }, "findOne")
      .toReturn([{ id: "1", name: "a" }], "find")
      .reset();

    const role = await dataSource.getRepository(Role).findOne({});
    const roles = await dataSource.getRepository(Role).find({});

    expect(role).toEqual({});
    expect(roles).toEqual({});
  });
});

describe("EntitySchema", () => {
  afterEach(() => {
    Sinon.restore();
  });

  it("EntitySchema dataSource.getRepository", async () => {
    const typeorm = new MockTypeORM();
    typeorm.onMock("UserEntitySchema").toReturn([], "find");

    const users = await dataSource.getRepository(UserEntitySchema).find();

    expect(users).toEqual([]);
  });

  it("EntitySchema DataSource.createQueryBuilder", async () => {
    const typeorm = new MockTypeORM();
    typeorm.onMock("UserEntitySchema").toReturn(["user"], "getOne");

    const users = await dataSource
      .createQueryBuilder(UserEntitySchema as any, "user")
      .select()
      .getOne();

    expect(users).toEqual(["user"]);
  });

  it("EntitySchema getRepository.createQueryBuilder", async () => {
    const typeorm = new MockTypeORM();
    typeorm.onMock("UserEntitySchema").toReturn(["user"], "getOne");

    const users = await dataSource
      .getRepository(UserEntitySchema)
      .createQueryBuilder("user")
      .select()
      .getOne();

    expect(users).toEqual(["user"]);
  });

  it("EntitySchema DataSource.manager.createQueryBuilder()", async () => {
    const typeorm = new MockTypeORM();
    typeorm.onMock("UserEntitySchema").toReturn(["user"], "getOne");

    const users = await dataSource.manager
      .createQueryBuilder(UserEntitySchema, "user")
      .select()
      .getOne();

    expect(users).toEqual(["user"]);
  });

  describe("queryRunner", () => {
    it("EntitySchema queryRunner", async () => {
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

    it("should save record", async () => {
      const typeorm = new MockTypeORM();
      const mockUser = { id: "newId", name: "a" };
      typeorm.onMock("UserEntitySchema").toReturn(mockUser, "save");

      const user = dataSource.manager.create("UserEntitySchema" as any, mockUser);
      const newUser = await dataSource.manager.save(user);

      expect(newUser).toEqual(mockUser);
    });
  });
});
