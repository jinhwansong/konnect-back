import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751610023699 implements MigrationInterface {
    name = 'Migrations1751610023699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`rejectedAt\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`rejectedAt\``);
    }

}
