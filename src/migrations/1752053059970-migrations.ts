import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752053059970 implements MigrationInterface {
    name = 'Migrations1752053059970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentoring_sessions\` ADD \`category\` enum ('general', 'hr', 'marketing', 'pr', 'sales', 'finance', 'planning', 'it', 'ux_ui', 'design', 'consulting', 'manufacturing', 'etc') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_sessions\` ADD \`isPublic\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD \`sessionId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`articleId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD \`articleId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`articles\` ADD \`thumbnail\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`articles\` ADD \`category\` enum ('career', 'job', 'study', 'tech', 'lifestyle', 'mentoring', 'notice', 'startup', 'portfolio', 'book', 'etc') NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD CONSTRAINT \`FK_1c2f59fdb914ac48cdd3f0adca6\` FOREIGN KEY (\`sessionId\`) REFERENCES \`mentoring_sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_eb69cbc1fa41ca7f0588749e016\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_c0354a9a009d3bb45a08655ce3b\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_c20404221e5c125a581a0d90c0e\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_c20404221e5c125a581a0d90c0e\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_c0354a9a009d3bb45a08655ce3b\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_eb69cbc1fa41ca7f0588749e016\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP FOREIGN KEY \`FK_1c2f59fdb914ac48cdd3f0adca6\``);
        await queryRunner.query(`ALTER TABLE \`articles\` DROP COLUMN \`category\``);
        await queryRunner.query(`ALTER TABLE \`articles\` DROP COLUMN \`thumbnail\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP COLUMN \`articleId\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`articleId\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP COLUMN \`sessionId\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_sessions\` DROP COLUMN \`isPublic\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_sessions\` DROP COLUMN \`category\``);
    }

}
