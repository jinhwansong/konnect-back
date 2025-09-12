import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1757704443802 implements MigrationInterface {
    name = 'Migrations1757704443802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_users_email\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`)`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_276779da446413a0d79598d4fbd\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_c20404221e5c125a581a0d90c0e\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_e3aebe2bd1c53467a07109be596\` FOREIGN KEY (\`parentId\`) REFERENCES \`comment\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_e3aebe2bd1c53467a07109be596\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_c20404221e5c125a581a0d90c0e\``);
        await queryRunner.query(`ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_276779da446413a0d79598d4fbd\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`email\` \`email\` varchar(255) NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_users_email\` ON \`users\` (\`email\`)`);
    }

}
