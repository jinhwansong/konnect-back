import { DataSource } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

// 테스트 환경 변수 로드
try {
  dotenv.config({ path: '.env.test' });
} catch (error) {
  console.warn('.env.test 파일을 찾을 수 없습니다. 기본값을 사용합니다.');
}

let testDataSource: DataSource;

beforeAll(async () => {
  ('🔧 테스트 DB 초기화 시작...');

  // 안전장치 재확인
  const dbDatabase = process.env.DB_DATABASE || 'konnect_test';
  if (!dbDatabase.includes('test')) {
    throw new Error(
      `❌ 테스트 환경에서 운영 DB 접근 시도! DB: ${dbDatabase}. `.repeat(3),
    );
  }

  // 테스트용 DataSource 생성
  testDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'test_user',
    password: process.env.DB_PASSWORD || 'test_password',
    database: dbDatabase,
    entities: [join(__dirname, '../src/entities/**/*.entity{.ts,.js}')],
    migrations: [join(__dirname, '../src/migrations/**/*{.ts,.js}')],
    synchronize: true, // 테스트에서는 스키마 자동 동기화
    dropSchema: true, // 테스트 시작 시 스키마 삭제
    logging: false, // 테스트에서는 로깅 비활성화
    charset: 'utf8mb4_general_ci',
    extra: {
      connectionLimit: 5,
    },
  });

  await testDataSource.initialize();
  ('✅ 테스트 DB 초기화 완료');
});

afterAll(async () => {
  ('🧹 테스트 DB 정리 시작...');

  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
    ('✅ 테스트 DB 정리 완료');
  }
});

// 글로벌 테스트 타임아웃 설정
jest.setTimeout(30000);
