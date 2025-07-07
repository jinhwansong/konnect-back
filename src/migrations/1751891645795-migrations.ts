import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1751891645795 implements MigrationInterface {
    name = 'Migrations1751891645795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_6bb61cbede7c869adde5587f345\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP FOREIGN KEY \`FK_2720900271f490565c067b5543a\``);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`reservationId\` \`failReason\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP COLUMN \`mentorId\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` ADD \`question\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` ADD \`expiresAt\` timestamp NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD \`menteeId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD \`reservationId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`reviewId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`status\` \`status\` enum ('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP COLUMN \`failReason\``);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD \`failReason\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD CONSTRAINT \`FK_ea06b3f4918c73a77b29a9e9bb1\` FOREIGN KEY (\`menteeId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD CONSTRAINT \`FK_edd36c97f8a939c36023b3acdb5\` FOREIGN KEY (\`reservationId\`) REFERENCES \`mentoring_reservation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_cfd8e81fac09d7339a32e57d904\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_80766db2b6ba746fc5633c9eb04\` FOREIGN KEY (\`reviewId\`) REFERENCES \`mentoring_reviews\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_80766db2b6ba746fc5633c9eb04\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_cfd8e81fac09d7339a32e57d904\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP FOREIGN KEY \`FK_edd36c97f8a939c36023b3acdb5\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP FOREIGN KEY \`FK_ea06b3f4918c73a77b29a9e9bb1\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP COLUMN \`failReason\``);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD \`failReason\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`status\` \`status\` enum ('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`reviewId\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP COLUMN \`reservationId\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` DROP COLUMN \`menteeId\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` DROP COLUMN \`expiresAt\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` DROP COLUMN \`question\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD \`mentorId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` CHANGE \`failReason\` \`reservationId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reviews\` ADD CONSTRAINT \`FK_2720900271f490565c067b5543a\` FOREIGN KEY (\`mentorId\`) REFERENCES \`mentors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_6bb61cbede7c869adde5587f345\` FOREIGN KEY (\`reservationId\`) REFERENCES \`mentoring_reservation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
