import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixReviewRelations1724820000000 implements MigrationInterface {
  name = 'FixReviewRelations1724820000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 잘못된 FK 제거 (이름은 SHOW CREATE TABLE로 확인 필요)
    await queryRunner.query(
      `ALTER TABLE mentoring_reviews DROP FOREIGN KEY FK_wrong_session`,
    );
    await queryRunner.query(
      `ALTER TABLE mentoring_reviews DROP FOREIGN KEY FK_wrong_reservation`,
    );

    // 올바른 FK 다시 생성
    await queryRunner.query(`
          ALTER TABLE mentoring_reviews
          ADD CONSTRAINT FK_reviews_reservation FOREIGN KEY (reservationId) REFERENCES mentoring_reservation(id) ON DELETE CASCADE
        `);
    await queryRunner.query(`
          ALTER TABLE mentoring_reviews
          ADD CONSTRAINT FK_reviews_session FOREIGN KEY (sessionId) REFERENCES mentoring_session(id) ON DELETE CASCADE
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 되돌릴 때를 대비해 FK 삭제
    await queryRunner.query(
      `ALTER TABLE mentoring_reviews DROP FOREIGN KEY FK_reviews_reservation`,
    );
    await queryRunner.query(
      `ALTER TABLE mentoring_reviews DROP FOREIGN KEY FK_reviews_session`,
    );
  }
}
