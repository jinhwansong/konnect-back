import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754240525963 implements MigrationInterface {
    name = 'Migrations1754240525963'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`social_accounts\` CHANGE \`provider\` \`provider\` enum ('google', 'kakao', 'naver') NOT NULL DEFAULT 'kakao'`);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` ADD UNIQUE INDEX \`IDX_bafc38c82e915cb4c8dba6a063\` (\`provider\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`phone\` \`phone\` varchar(11) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`phone\` \`phone\` varchar(11) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` DROP INDEX \`IDX_bafc38c82e915cb4c8dba6a063\``);
        await queryRunner.query(`ALTER TABLE \`social_accounts\` CHANGE \`provider\` \`provider\` enum ('google', 'kakao', 'naver') NULL DEFAULT 'kakao'`);
    }

}
