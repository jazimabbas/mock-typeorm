import Sinon, { SinonStub } from "sinon";
import { describe, expect, it, afterEach } from "vitest";
import { MockTypeORM } from "../src";
import { dataSource, Role, UserEntitySchema } from "./utils/mock";

describe("QueryBuilder", () => {
  afterEach(() => {
    Sinon.restore();
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

  describe("EntitySchema", () => {
    describe("using getRepository", () => {
      it("should run when passing EntitySchema as a class", async () => {
        const typeorm = new MockTypeORM();
        typeorm.onMock("UserEntitySchema").toReturn(["user"], "getOne");

        const users = await dataSource
          .getRepository(UserEntitySchema)
          .createQueryBuilder("user")
          .select()
          .getOne();

        expect(users).toEqual(["user"]);
      });

      it("should run when passing EntitySchema as a string", async () => {
        const typeorm = new MockTypeORM();
        typeorm.onMock("UserEntitySchema").toReturn(["user"], "getOne");

        const users = await dataSource
          .getRepository("UserEntitySchema")
          .createQueryBuilder("user")
          .select()
          .getOne();

        expect(users).toEqual(["user"]);
      });
    });

    describe("using dataSource", () => {
      it("should run when passing EntitySchema as a class", async () => {
        const typeorm = new MockTypeORM();
        typeorm.onMock("UserEntitySchema").toReturn(["user"], "getOne");

        const users = await dataSource
          .createQueryBuilder(UserEntitySchema, "user")
          .select()
          .getOne();

        expect(users).toEqual(["user"]);
      });

      it("should run when passing EntitySchema as a string", async () => {
        const typeorm = new MockTypeORM();
        typeorm.onMock("UserEntitySchema").toReturn(["user"], "getOne");

        const users = await dataSource
          .createQueryBuilder("UserEntitySchema", "user")
          .select()
          .getOne();

        expect(users).toEqual(["user"]);
      });
    });

    describe("using dataSource.manager", () => {
      it("should run when passing EntitySchema as a class", async () => {
        const typeorm = new MockTypeORM();
        typeorm.onMock("UserEntitySchema").toReturn(["user"], "getOne");

        const users = await dataSource.manager
          .createQueryBuilder(UserEntitySchema, "user")
          .select()
          .getOne();

        expect(users).toEqual(["user"]);
      });

      it("should run when passing EntitySchema as a string", async () => {
        const typeorm = new MockTypeORM();
        typeorm.onMock("UserEntitySchema").toReturn(["user"], "getOne");

        const users = await dataSource.manager
          .createQueryBuilder("UserEntitySchema", "user")
          .select()
          .getOne();

        expect(users).toEqual(["user"]);
      });
    });
  });
});
