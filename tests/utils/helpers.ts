import { dataSource, Role } from "./mock";

export async function transaction() {
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const repo = queryRunner.manager.getRepository(Role);
    const roles = await repo.find();

    await queryRunner.commitTransaction();

    return roles;
  } catch (err) {
    console.log("Error", err);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
}
