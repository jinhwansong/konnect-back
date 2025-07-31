import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753796076123 implements MigrationInterface {
    name = 'Migrations1753796076123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`sessionId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` CHANGE \`targetType\` \`targetType\` enum ('review', 'article', 'session') NULL DEFAULT 'article'`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_855d1507c71a2c511db00211a76\` FOREIGN KEY (\`sessionId\`) REFERENCES \`mentoring_sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_855d1507c71a2c511db00211a76\``);
        await queryRunner.query(`ALTER TABLE \`likes\` CHANGE \`targetType\` \`targetType\` enum ('review', 'article') NULL DEFAULT 'article'`);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`sessionId\``);
    }

}
