import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration17634826908911763482691797 implements MigrationInterface {
    name = 'Migration17634826908911763482691797'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`introduce\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`introduce\` varchar(500) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`introduce\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`introduce\` varchar(100) NOT NULL`);
    }

}
