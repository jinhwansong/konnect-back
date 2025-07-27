import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753427334991 implements MigrationInterface {
    name = 'Migrations1753427334991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`expertise\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`expertise\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`expertise\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`expertise\` varchar(255) NOT NULL`);
    }

}
