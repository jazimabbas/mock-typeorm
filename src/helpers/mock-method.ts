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

  const mockDataExtractedFrom = mockTypeORM.mockHistory[repositoryName][method];
  ++mockTypeORM.mockHistory[repositoryName][method];

  const mockData =
    mockTypeORM.mocks[repositoryName][method][mockDataExtractedFrom] ??
    mockTypeORM.mocks[repositoryName][method][0];
  if (!mockData) return {};

  if (mockData instanceof Error) throw mockData;
  return mockData;
}
