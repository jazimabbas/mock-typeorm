import { Column, DataSource, Entity, EntitySchema, PrimaryGeneratedColumn } from "typeorm";

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

@Entity({ name: "roles" })
class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "text", nullable: false })
  name: string;
}

@Entity({ name: "users" })
class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "name", type: "text", nullable: false })
  name: string;
}

const UserEntitySchema = new EntitySchema({
  name: "UserEntitySchema",
  tableName: "userEntitySchema",
  columns: [],
});

export { dataSource, Role, User, UserEntitySchema };
