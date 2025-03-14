import { MockTypeORM } from "../mock-typeorm";

export function mockMethod(
  mockTypeORM: MockTypeORM,
  method: string,
  repositoryName: string,
) {
  if (!repositoryName) return {};

  const repoMocks = mockTypeORM.mocks[repositoryName];
  if (!repoMocks) return {};

  const repoMethodMocks = repoMocks[method];
  if (!repoMethodMocks) return {};

  /**
   * @description
   * This would be an index of the mock data to return.
   * @example
   * ```ts
   * const typeorm = new MockTypeORM();
   * typeorm
   *   .onMock(Role)
   *   .toReturn({ id: "1", name: "abc"}, "findOne")
   *   .toReturn({ id: "2" }, "findOne")
   * ```
   * Now the typeorm mock object would look like this:
   * ```ts
   * {
   *   Role: {
   *     findOne: {
   *       0: { id: "1", name: "abc" },
   *       1: { id: "2" }
   *     }
   *   }
   * }
   * ```
   * If the `findOne` method is called twice, the first call would return the object at index 0
   * and the second call would return the object at index 1.
   */
  const mockDataExtractedFrom = mockTypeORM.mockHistory[repositoryName][method];
  ++mockTypeORM.mockHistory[repositoryName][method];

  let mockData: unknown;
  const mockRepositoryMethodData = mockTypeORM.mocks[repositoryName][
    method
  ] as Record<string, never>;

  if (
    Object.prototype.hasOwnProperty.call(
      mockRepositoryMethodData,
      mockDataExtractedFrom,
    )
  ) {
    mockData = mockRepositoryMethodData[mockDataExtractedFrom];
  } else {
    mockData = mockRepositoryMethodData[0];
  }

  if (mockData instanceof Error) throw mockData;
  return mockData;
}
