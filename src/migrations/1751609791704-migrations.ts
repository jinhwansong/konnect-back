import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751609791704 implements MigrationInterface {
    name = 'Migrations1751609791704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP FOREIGN KEY \`FK_ea06b3f4918c73a77b29a9e9bb1\``);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP FOREIGN KEY \`FK_3524b07524e5266f874a3be1ae1\``);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP FOREIGN KEY \`FK_c837d34e699a0f22245d56d02ca\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_c0354a9a009d3bb45a08655ce3b\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_c20404221e5c125a581a0d90c0e\``);
        await queryRunner.query(`CREATE TABLE \`likes\` (\`id\` varchar(36) NOT NULL, \`targetType\` enum ('review', 'article') NULL DEFAULT 'article', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP COLUMN \`menteeId\``);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP COLUMN \`targetType\``);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP COLUMN \`reviewId\``);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP COLUMN \`articleId\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`refreshToken\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP COLUMN \`articleId\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`reason\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`articles\` ADD \`content\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`introduce\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`introduce\` varchar(100) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`introduce\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` ADD \`introduce\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`articles\` DROP COLUMN \`content\``);
        await queryRunner.query(`ALTER TABLE \`mentors\` DROP COLUMN \`reason\``);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD \`articleId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`refreshToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD \`articleId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD \`reviewId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD \`targetType\` enum ('review', 'article') NULL DEFAULT 'article'`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD \`menteeId\` varchar(36) NULL`);
        await queryRunner.query(`DROP TABLE \`likes\``);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_c20404221e5c125a581a0d90c0e\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_c0354a9a009d3bb45a08655ce3b\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD CONSTRAINT \`FK_c837d34e699a0f22245d56d02ca\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD CONSTRAINT \`FK_3524b07524e5266f874a3be1ae1\` FOREIGN KEY (\`reviewId\`) REFERENCES \`mentoring_reviews\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD CONSTRAINT \`FK_ea06b3f4918c73a77b29a9e9bb1\` FOREIGN KEY (\`menteeId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
