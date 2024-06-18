import { DataSource } from "typeorm";

export type DataSourceMethods = keyof {
  [K in keyof DataSource as DataSource[K] extends (...args: any[]) => any ? K : never]: K;
};

export const dataSourceMethods: DataSourceMethods[] = [
  "close",
  "connect",
  "destroy",
  "dropDatabase",
  "initialize",
  "runMigrations",
  "setOptions",
  "showMigrations",
  "synchronize",
  "undoLastMigration",
];
