import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1756115565640 implements MigrationInterface {
    name = 'Migrations1756115565640'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` ADD \`roomId\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` DROP COLUMN \`roomId\``);
    }

}
