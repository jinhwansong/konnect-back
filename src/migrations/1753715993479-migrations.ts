import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753715993479 implements MigrationInterface {
    name = 'Migrations1753715993479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_cfd8e81fac09d7339a32e57d904\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_80766db2b6ba746fc5633c9eb04\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_eb69cbc1fa41ca7f0588749e016\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`userId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`reviewId\``);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`reviewId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`articleId\``);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`articleId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_cfd8e81fac09d7339a32e57d904\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_80766db2b6ba746fc5633c9eb04\` FOREIGN KEY (\`reviewId\`) REFERENCES \`mentoring_reviews\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_eb69cbc1fa41ca7f0588749e016\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_eb69cbc1fa41ca7f0588749e016\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_80766db2b6ba746fc5633c9eb04\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_cfd8e81fac09d7339a32e57d904\``);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`articleId\``);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`articleId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`reviewId\``);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`reviewId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD \`userId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_eb69cbc1fa41ca7f0588749e016\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_80766db2b6ba746fc5633c9eb04\` FOREIGN KEY (\`reviewId\`) REFERENCES \`mentoring_reviews\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`likes\` ADD CONSTRAINT \`FK_cfd8e81fac09d7339a32e57d904\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
