import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753710357085 implements MigrationInterface {
    name = 'Migrations1753710357085'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`position\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`position\` enum ('backend', 'frontend', 'fullstack', 'mobile', 'devops', 'security', 'data_engineer', 'data_scientist', 'pm_po', 'ux_designer', 'ui_designer', 'planner', 'marketing', 'hr', 'cs', 'finance', 'etc') NOT NULL DEFAULT 'backend'`);
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`career\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`career\` enum ('junior', 'middle', 'senior', 'lead') NOT NULL DEFAULT 'junior'`);
        await queryRunner.query(`ALTER TABLE \`articles\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`articles\` ADD \`content\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`articles\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`articles\` ADD \`content\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`career\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`career\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`position\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`position\` varchar(255) NULL`);
    }

}
