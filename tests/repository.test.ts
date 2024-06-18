import Sinon from "sinon";
import { MockTypeORM } from "../src/mock-typeorm";
import { dataSource, Role } from "./utils/mock";
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
        typeorm.onMock(Role).toReturn(mockData, method);

        const roleRepository = dataSource.getRepository(Role);
        const result = await roleRepository[method as any]();

        expect(result).toEqual(mockData);
      }
    );
  });

  it("should return different data when we call same methods in one function", async () => {
    const typeorm = new MockTypeORM();
    typeorm.onMock(Role).toReturn(["role1"], "find").toReturn(["role2"], "find");

    const roleRepository = dataSource.getRepository(Role);
    const roles = await roleRepository.find();
    const newRoles = await roleRepository.find();

    expect(roles).toEqual(["role1"]);
    expect(newRoles).toEqual(["role2"]);
  });

  it("should throw an error if mock method throws an error", async () => {
    const typeorm = new MockTypeORM();
    typeorm.onMock(Role).toReturn(new Error("Something failed"), "find");

    const roleRepository = dataSource.getRepository(Role);

    await expect(roleRepository.find({})).rejects.toThrowError(/failed/i);
  });
});
