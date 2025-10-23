import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

export default async function globalSetup() {
  ('🚀 E2E 테스트 글로벌 설정 시작...');

  try {
    // .env.test 파일이 없으면 자동 생성
    const envTestPath = join(process.cwd(), '.env.test');

    if (!existsSync(envTestPath)) {
      ('📝 .env.test 파일이 없어서 자동 생성합니다...');

      const envTestContent = `# E2E 테스트용 환경 변수
NODE_ENV=test
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=test_user
DB_PASSWORD=test_password
DB_DATABASE=konnect_test
JWT_SECRET=test-jwt-secret-for-e2e-testing-only
JWT_PUBLIC_KEY=
JWT_PRIVATE_KEY=
MONGO_URL=mongodb://localhost:27017/konnect_test
REDIS_URL=redis://localhost:6379/1
`;

      writeFileSync(envTestPath, envTestContent);
      ('✅ .env.test 파일이 생성되었습니다.');
    } else {
      ('✅ .env.test 파일이 이미 존재합니다.');
    }

    // 환경 변수 로드
    process.env.NODE_ENV = 'test';

    // 안전장치: 테스트 환경 확인
    if (process.env.DB_DATABASE && !process.env.DB_DATABASE.includes('test')) {
      throw new Error(
        `❌ 테스트 환경에서 운영 DB 접근 시도 감지! DB: ${process.env.DB_DATABASE}. `.repeat(
          3,
        ),
      );
    }

    ('🛡️ 테스트 환경 안전장치 활성화됨');
    `📊 테스트 DB: ${process.env.DB_DATABASE || 'konnect_test'}`;
  } catch (error) {
    console.error('❌ 글로벌 설정 실패:', error.message);
    throw error;
  }
}
