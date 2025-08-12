import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1755018721028 implements MigrationInterface {
    name = 'Migrations1755018721028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` ADD \`paidAt\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` DROP COLUMN \`paidAt\``);
    }

}
