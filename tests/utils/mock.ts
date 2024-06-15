import { DataSource } from "typeorm";

const dataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  username: "root",
  password: "password",
  port: 3305,
  synchronize: false,
  logging: true,
  database: "mock",
});

export { dataSource };
