import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration17635631669051763563167406 implements MigrationInterface {
    name = 'Migration17635631669051763563167406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`introduce\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`introduce\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`introduce\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`introduce\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`notifications\` ADD CONSTRAINT \`FK_692a909ee0fa9383e7859f9b406\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_692a909ee0fa9383e7859f9b406\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`introduce\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`introduce\` varchar(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`introduce\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`introduce\` varchar(100) NOT NULL`);
    }

}
