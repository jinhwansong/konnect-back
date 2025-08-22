import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1755843643064 implements MigrationInterface {
    name = 'Migrations1755843643064'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_6bb61cbede7c869adde5587f34\` ON \`payment\``);
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` CHANGE \`status\` \`status\` enum ('pending', 'expired', 'confirmed', 'cancelled', 'completed', 'progress') NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` CHANGE \`status\` \`status\` enum ('pending', 'confirmed', 'cancelled', 'completed', 'progress') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_6bb61cbede7c869adde5587f34\` ON \`payment\` (\`reservationId\`)`);
    }

}
