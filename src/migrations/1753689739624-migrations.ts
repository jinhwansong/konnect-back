import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753689739624 implements MigrationInterface {
    name = 'Migrations1753689739624'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` ADD \`rejectReason\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_sessions\` CHANGE \`category\` \`category\` enum ('hr', 'marketing', 'pr', 'sales', 'finance', 'planning', 'it', 'ux_ui', 'design', 'consulting', 'manufacturing', 'etc') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`mentoring_sessions\` CHANGE \`category\` \`category\` enum ('general', 'hr', 'marketing', 'pr', 'sales', 'finance', 'planning', 'it', 'ux_ui', 'design', 'consulting', 'manufacturing', 'etc') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`mentoring_reservation\` DROP COLUMN \`rejectReason\``);
    }

}
