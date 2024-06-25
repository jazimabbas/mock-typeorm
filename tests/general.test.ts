import { describe, expect, it, afterEach, afterAll, beforeAll } from "vitest";
import { MockTypeORM } from "../src";
import { dataSource, Role } from "./utils/mock";
import { getDefinedMethods } from "../src/helpers/general";

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
    typeorm
      .onMock(Role)
      .toReturn({ id: "1", name: "a" }, "findOne")
      .reset("findOne");

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

  describe("getDefinedMethods()", () => {
    it("should return only the methods that exist on the object", () => {
      const obj = {
        method1: () => {},
        method2: () => {},
        property: 123,
      };
      const methods = ["method1", "method2", "method3"];
      const result = getDefinedMethods(obj, methods);
      expect(result).toEqual(["method1", "method2"]);
    });

    it("should return an empty array if no methods exist on the object", () => {
      const obj = {
        property1: 123,
        property2: "value",
      };
      const methods = ["method1", "method2"];
      const result = getDefinedMethods(obj, methods);
      expect(result).toEqual([]);
    });

    it("should return an empty array if the methods array is empty", () => {
      const obj = {
        method1: () => {},
        method2: () => {},
      };
      const methods = [];
      const result = getDefinedMethods(obj, methods);
      expect(result).toEqual([]);
    });

    it("should handle objects with no properties gracefully", () => {
      const obj = {};
      const methods = ["method1", "method2"];
      const result = getDefinedMethods(obj, methods);
      expect(result).toEqual([]);
    });

    it("should return the same array if all methods exist on the object", () => {
      const obj = {
        method1: () => {},
        method2: () => {},
        method3: () => {},
      };
      const methods = ["method1", "method2", "method3"];
      const result = getDefinedMethods(obj, methods);
      expect(result).toEqual(["method1", "method2", "method3"]);
    });
  });
});
