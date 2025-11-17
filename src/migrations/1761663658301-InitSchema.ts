import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1761663658301 implements MigrationInterface {
    name = 'InitSchema1761663658301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`comment\` (
                \`id\` varchar(36) NOT NULL,
                \`content\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`authorId\` varchar(36) NULL,
                \`articleId\` varchar(36) NULL,
                \`parentId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`articles\` (
                \`id\` varchar(36) NOT NULL,
                \`title\` varchar(255) NOT NULL,
                \`content\` text NOT NULL,
                \`thumbnail\` varchar(255) NULL,
                \`category\` enum (
                    'career',
                    'job',
                    'study',
                    'tech',
                    'lifestyle',
                    'mentoring',
                    'notice',
                    'startup',
                    'portfolio',
                    'book',
                    'etc'
                ) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`views\` int NOT NULL DEFAULT '0',
                \`authorId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`mentoring_schedules\` (
                \`id\` varchar(36) NOT NULL,
                \`dayOfWeek\` enum (
                    'MONDAY',
                    'TUESDAY',
                    'WEDNESDAY',
                    'THURSDAY',
                    'FRIDAY',
                    'SATURDAY',
                    'SUNDAY'
                ) NOT NULL,
                \`startTime\` time NOT NULL,
                \`endTime\` time NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`mentorId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`mentors\` (
                \`id\` varchar(36) NOT NULL,
                \`company\` varchar(20) NULL,
                \`introduce\` varchar(100) NOT NULL,
                \`position\` enum (
                    'backend',
                    'frontend',
                    'fullstack',
                    'mobile',
                    'devops',
                    'security',
                    'data_engineer',
                    'data_scientist',
                    'pm_po',
                    'ux_designer',
                    'ui_designer',
                    'marketing',
                    'hr',
                    'cs',
                    'finance',
                    'etc'
                ) NOT NULL DEFAULT 'backend',
                \`expertise\` text NOT NULL,
                \`career\` enum ('junior', 'middle', 'senior', 'lead') NOT NULL DEFAULT 'junior',
                \`portfolio\` varchar(255) NOT NULL,
                \`status\` enum ('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
                \`reason\` varchar(100) NULL,
                \`isCompanyHidden\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`rejectedAt\` timestamp NULL,
                \`userId\` varchar(36) NULL,
                UNIQUE INDEX \`REL_32430293b6e29c32395eadaa5c\` (\`userId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`mentoring_sessions\` (
                \`id\` varchar(36) NOT NULL,
                \`title\` varchar(255) NOT NULL,
                \`description\` text NOT NULL,
                \`price\` int NOT NULL,
                \`duration\` int NOT NULL,
                \`averageRating\` float NOT NULL DEFAULT '0',
                \`reviewCount\` int NOT NULL DEFAULT '0',
                \`category\` enum (
                    'business',
                    'marketing',
                    'sales',
                    'finance',
                    'hr',
                    'it',
                    'design',
                    'consulting',
                    'manufacturing',
                    'etc'
                ) NOT NULL,
                \`isPublic\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`mentorId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`payment\` (
                \`id\` varchar(36) NOT NULL,
                \`price\` int NOT NULL,
                \`orderId\` varchar(60) NOT NULL,
                \`paymentKey\` varchar(60) NULL,
                \`receiptUrl\` text NULL,
                \`status\` enum ('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
                \`failReason\` text NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`userId\` varchar(36) NULL,
                \`reservationId\` varchar(36) NULL,
                UNIQUE INDEX \`REL_6bb61cbede7c869adde5587f34\` (\`reservationId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`mentoring_reservation\` (
                \`id\` varchar(36) NOT NULL,
                \`status\` enum (
                    'pending',
                    'expired',
                    'confirmed',
                    'cancelled',
                    'completed',
                    'progress'
                ) NOT NULL DEFAULT 'pending',
                \`date\` date NOT NULL,
                \`startTime\` time NOT NULL,
                \`endTime\` time NOT NULL,
                \`question\` text NOT NULL,
                \`expiresAt\` timestamp NULL,
                \`paidAt\` timestamp NULL,
                \`rejectReason\` text NULL,
                \`roomId\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`menteeId\` varchar(36) NULL,
                \`sessionId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`mentoring_reviews\` (
                \`id\` varchar(36) NOT NULL,
                \`rating\` int NOT NULL,
                \`content\` text NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`menteeId\` varchar(36) NULL,
                \`reservationId\` varchar(36) NULL,
                \`sessionId\` varchar(36) NULL,
                UNIQUE INDEX \`REL_edd36c97f8a939c36023b3acdb\` (\`reservationId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`likes\` (
                \`id\` varchar(36) NOT NULL,
                \`targetType\` enum ('review', 'article', 'session') NULL DEFAULT 'article',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`userId\` varchar(255) NOT NULL,
                \`reviewId\` varchar(255) NULL,
                \`articleId\` varchar(255) NULL,
                \`sessionId\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`social_accounts\` (
                \`id\` varchar(36) NOT NULL,
                \`provider\` enum ('google', 'kakao', 'naver') NOT NULL DEFAULT 'kakao',
                \`socialId\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`userId\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_bafc38c82e915cb4c8dba6a063\` (\`provider\`),
                UNIQUE INDEX \`IDX_09d4b17a7a58dbc08d7929fa93\` (\`socialId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`notifications\` (
                \`id\` varchar(36) NOT NULL,
                \`type\` enum (
                    'reservation',
                    'chat',
                    'article',
                    'payment',
                    'mentor',
                    'review'
                ) NOT NULL,
                \`message\` varchar(255) NOT NULL,
                \`link\` varchar(255) NULL,
                \`isRead\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`userId\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user_fcm_tokens\` (
                \`id\` varchar(36) NOT NULL,
                \`token\` varchar(500) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`userId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(100) NULL,
                \`nickname\` varchar(30) NOT NULL,
                \`name\` varchar(30) NOT NULL,
                \`phone\` varchar(11) NULL,
                \`image\` text NULL,
                \`role\` enum ('mentee', 'mentor', 'admin') NOT NULL DEFAULT 'mentee',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deletedAt\` datetime(6) NULL,
                UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
                UNIQUE INDEX \`IDX_ad02a1be8707004cb805a4b502\` (\`nickname\`),
                UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_276779da446413a0d79598d4fbd\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_c20404221e5c125a581a0d90c0e\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_e3aebe2bd1c53467a07109be596\` FOREIGN KEY (\`parentId\`) REFERENCES \`comment\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`articles\`
            ADD CONSTRAINT \`FK_65d9ccc1b02f4d904e90bd76a34\` FOREIGN KEY (\`authorId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_schedules\`
            ADD CONSTRAINT \`FK_6f3bfe790acb74dd74dbb8aad28\` FOREIGN KEY (\`mentorId\`) REFERENCES \`mentors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentors\`
            ADD CONSTRAINT \`FK_32430293b6e29c32395eadaa5cb\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_sessions\`
            ADD CONSTRAINT \`FK_95437d8e0b41f2bf7030cac1ec7\` FOREIGN KEY (\`mentorId\`) REFERENCES \`mentors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`payment\`
            ADD CONSTRAINT \`FK_b046318e0b341a7f72110b75857\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`payment\`
            ADD CONSTRAINT \`FK_6bb61cbede7c869adde5587f345\` FOREIGN KEY (\`reservationId\`) REFERENCES \`mentoring_reservation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reservation\`
            ADD CONSTRAINT \`FK_8be68191ce173ca5f3414a46df6\` FOREIGN KEY (\`menteeId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reservation\`
            ADD CONSTRAINT \`FK_58c83a7d52b82dd73791d43e6ac\` FOREIGN KEY (\`sessionId\`) REFERENCES \`mentoring_sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reviews\`
            ADD CONSTRAINT \`FK_ea06b3f4918c73a77b29a9e9bb1\` FOREIGN KEY (\`menteeId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reviews\`
            ADD CONSTRAINT \`FK_edd36c97f8a939c36023b3acdb5\` FOREIGN KEY (\`reservationId\`) REFERENCES \`mentoring_reservation\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reviews\`
            ADD CONSTRAINT \`FK_1c2f59fdb914ac48cdd3f0adca6\` FOREIGN KEY (\`sessionId\`) REFERENCES \`mentoring_sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`likes\`
            ADD CONSTRAINT \`FK_cfd8e81fac09d7339a32e57d904\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`likes\`
            ADD CONSTRAINT \`FK_80766db2b6ba746fc5633c9eb04\` FOREIGN KEY (\`reviewId\`) REFERENCES \`mentoring_reviews\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`likes\`
            ADD CONSTRAINT \`FK_eb69cbc1fa41ca7f0588749e016\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`likes\`
            ADD CONSTRAINT \`FK_855d1507c71a2c511db00211a76\` FOREIGN KEY (\`sessionId\`) REFERENCES \`mentoring_sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`social_accounts\`
            ADD CONSTRAINT \`FK_7de933c3670ec71c68aca0afd56\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\`
            ADD CONSTRAINT \`FK_692a909ee0fa9383e7859f9b406\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_fcm_tokens\`
            ADD CONSTRAINT \`FK_9e490d67ebeccb50ad20655d3ff\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user_fcm_tokens\` DROP FOREIGN KEY \`FK_9e490d67ebeccb50ad20655d3ff\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_692a909ee0fa9383e7859f9b406\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`social_accounts\` DROP FOREIGN KEY \`FK_7de933c3670ec71c68aca0afd56\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_855d1507c71a2c511db00211a76\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_eb69cbc1fa41ca7f0588749e016\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_80766db2b6ba746fc5633c9eb04\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`likes\` DROP FOREIGN KEY \`FK_cfd8e81fac09d7339a32e57d904\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reviews\` DROP FOREIGN KEY \`FK_1c2f59fdb914ac48cdd3f0adca6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reviews\` DROP FOREIGN KEY \`FK_edd36c97f8a939c36023b3acdb5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reviews\` DROP FOREIGN KEY \`FK_ea06b3f4918c73a77b29a9e9bb1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reservation\` DROP FOREIGN KEY \`FK_58c83a7d52b82dd73791d43e6ac\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_reservation\` DROP FOREIGN KEY \`FK_8be68191ce173ca5f3414a46df6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_6bb61cbede7c869adde5587f345\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_b046318e0b341a7f72110b75857\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_sessions\` DROP FOREIGN KEY \`FK_95437d8e0b41f2bf7030cac1ec7\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentors\` DROP FOREIGN KEY \`FK_32430293b6e29c32395eadaa5cb\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`mentoring_schedules\` DROP FOREIGN KEY \`FK_6f3bfe790acb74dd74dbb8aad28\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`articles\` DROP FOREIGN KEY \`FK_65d9ccc1b02f4d904e90bd76a34\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_e3aebe2bd1c53467a07109be596\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_c20404221e5c125a581a0d90c0e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_276779da446413a0d79598d4fbd\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_ad02a1be8707004cb805a4b502\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user_fcm_tokens\`
        `);
        await queryRunner.query(`
            DROP TABLE \`notifications\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_09d4b17a7a58dbc08d7929fa93\` ON \`social_accounts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_bafc38c82e915cb4c8dba6a063\` ON \`social_accounts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`social_accounts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`likes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_edd36c97f8a939c36023b3acdb\` ON \`mentoring_reviews\`
        `);
        await queryRunner.query(`
            DROP TABLE \`mentoring_reviews\`
        `);
        await queryRunner.query(`
            DROP TABLE \`mentoring_reservation\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_6bb61cbede7c869adde5587f34\` ON \`payment\`
        `);
        await queryRunner.query(`
            DROP TABLE \`payment\`
        `);
        await queryRunner.query(`
            DROP TABLE \`mentoring_sessions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_32430293b6e29c32395eadaa5c\` ON \`mentors\`
        `);
        await queryRunner.query(`
            DROP TABLE \`mentors\`
        `);
        await queryRunner.query(`
            DROP TABLE \`mentoring_schedules\`
        `);
        await queryRunner.query(`
            DROP TABLE \`articles\`
        `);
        await queryRunner.query(`
            DROP TABLE \`comment\`
        `);
    }

}
