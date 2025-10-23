import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

// 환경별 .env 파일 로드
try {
  if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: '.env.test' });
  } else {
    dotenv.config();
  }
} catch (error) {
  console.warn('환경 변수 파일 로드 실패:', error.message);
}

// 안전장치: 테스트 환경에서 운영 DB 접근 방지
const isTestEnv = process.env.NODE_ENV === 'test';
const isProdEnv = process.env.NODE_ENV === 'production';
const dbDatabase = process.env.DB_DATABASE || 'konnect';

if (isTestEnv) {
  if (!dbDatabase.includes('test') && dbDatabase !== 'konnect_test') {
    throw new Error(
      `❌ 테스트 환경에서는 테스트 DB만 사용 가능합니다. 현재 DB: ${dbDatabase}. `.repeat(
        3,
      ),
    );
  }
} else {
  if (dbDatabase.includes('test')) {
    throw new Error(
      `❌ 운영/개발 환경에서는 테스트 DB 접근이 금지됩니다. 현재 DB: ${dbDatabase}. `.repeat(
        3,
      ),
    );
  }
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbDatabase,
  // CLI에서 entities를 정확히 찾기 위한 경로 수정
  entities: [
    join(__dirname, 'src/entities/**/*.entity.{ts,js}'),
    join(__dirname, 'src/entities/index.ts'), // index.ts도 포함
  ],
  migrations: [join(__dirname, 'src/migrations/**/*.{ts,js}')],
  // 환경별 synchronize 설정
  synchronize: isTestEnv ? true : false, // 테스트에서만 자동 동기화
  dropSchema: isTestEnv ? true : false, // 테스트에서만 스키마 삭제
  // 환경별 migration 설정
  migrationsRun: isProdEnv ? true : false, // 프로덕션에서만 마이그레이션 자동 실행
  migrationsTableName: 'migrations',
  logging: isProdEnv ? false : true, // 프로덕션에서만 로깅 비활성화
  charset: 'utf8mb4_general_ci',
  extra: {
    connectionLimit: isTestEnv ? 5 : 10,
  },
});

// CLI에서 사용할 때 환경 정보 출력
if (require.main === module) {
  (
    `🔧 DataSource 초기화 - 환경: ${process.env.NODE_ENV || 'development'}`,
  );
  (`📊 데이터베이스: ${dbDatabase}`);
  (`🏠 호스트: ${process.env.DB_HOST || 'localhost'}`);
  (`👤 사용자: ${process.env.DB_USERNAME || 'root'}`);
  (`🔄 Synchronize: ${isTestEnv ? 'true (테스트용)' : 'false'}`);
  (
    `📝 Migrations Run: ${isProdEnv ? 'true (프로덕션용)' : 'false'}`,
  );

  // entities 경로 확인
  (
    `📁 Entities 경로: ${join(__dirname, 'src/entities/**/*.entity.{ts,js}')}`,
  );
}
