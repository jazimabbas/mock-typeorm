import { SelectQueryBuilder } from "typeorm";

export function mockCreateQueryBuilder(this: any, repositoryName?: string) {
  const allMethods = getAllQueryBuilderMethods();

  const methodsObject = {};
  allMethods.forEach((m) => {
    methodsObject[m] = SelectQueryBuilder.prototype[m];
  });

  return { ...methodsObject, __repositoryName: repositoryName } as any;
}

function getAllQueryBuilderMethods() {
  return Object.getOwnPropertyNames(SelectQueryBuilder.prototype);
}
