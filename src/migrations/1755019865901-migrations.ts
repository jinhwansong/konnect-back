import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1755019865901 implements MigrationInterface {
    name = 'Migrations1755019865901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment\` ADD \`reservationId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD UNIQUE INDEX \`IDX_6bb61cbede7c869adde5587f34\` (\`reservationId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_6bb61cbede7c869adde5587f34\` ON \`payment\` (\`reservationId\`)`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_6bb61cbede7c869adde5587f345\` FOREIGN KEY (\`reservationId\`) REFERENCES \`mentoring_reservation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_6bb61cbede7c869adde5587f345\``);
        await queryRunner.query(`DROP INDEX \`REL_6bb61cbede7c869adde5587f34\` ON \`payment\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP INDEX \`IDX_6bb61cbede7c869adde5587f34\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP COLUMN \`reservationId\``);
    }

}
