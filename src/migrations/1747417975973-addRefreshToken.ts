import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRefreshToken implements MigrationInterface {
  name = 'AddRefreshToken1747417975973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`refreshToken\` varchar(255) NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`users\` DROP COLUMN \`refreshToken\``,
    );
  }
}
