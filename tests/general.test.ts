import { describe, expect, it, afterEach, afterAll, beforeAll } from "vitest";
import { MockTypeORM } from "../src";
import { dataSource, Role } from "./utils/mock";

describe("General", () => {
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
