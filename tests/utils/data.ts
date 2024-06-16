import { repositoryMethods } from "../../src/constants/repository";

export const mockRepositoryMethods = repositoryMethods.map((method) => {
  let mockData: any = { role: "role" };
  if (method === "find") mockData = ["role"];

  return { method, mockData, methodLabel: `${method}()` };
});
