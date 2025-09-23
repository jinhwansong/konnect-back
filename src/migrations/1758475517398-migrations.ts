import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1758475517398 implements MigrationInterface {
    name = 'Migrations1758475517398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_fcm_tokens\` (\`id\` varchar(36) NOT NULL, \`token\` varchar(500) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`fcmToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`notifications\` CHANGE \`type\` \`type\` enum ('reservation', 'chat', 'article', 'payment', 'mentor', 'review') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user_fcm_tokens\` ADD CONSTRAINT \`FK_9e490d67ebeccb50ad20655d3ff\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_fcm_tokens\` DROP FOREIGN KEY \`FK_9e490d67ebeccb50ad20655d3ff\``);
        await queryRunner.query(`ALTER TABLE \`notifications\` CHANGE \`type\` \`type\` enum ('reservation', 'chat', 'article', 'payment', 'mentor') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`fcmToken\``);
        await queryRunner.query(`DROP TABLE \`user_fcm_tokens\``);
    }

}
