#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

('🔧 E2E 테스트 환경 설정 스크립트 시작...');

// .env.test 파일 경로
const envTestPath = path.join(__dirname, '..', '.env.test');

// .env.test 파일이 이미 존재하는지 확인
if (fs.existsSync(envTestPath)) {
  ('✅ .env.test 파일이 이미 존재합니다.');
  ('📄 현재 .env.test 내용:');
  fs.readFileSync(envTestPath, 'utf8');
  return;
}

// .env.test 파일 내용
const envTestContent = `# E2E 테스트용 환경 변수
# ⚠️ 주의: 이 파일은 테스트 전용입니다. 운영 DB와 완전히 분리됩니다.

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

# 🛡️ 안전장치:
# - NODE_ENV=test로 설정하여 운영 환경과 분리
# - konnect_test DB 사용으로 운영 데이터 보호
# - 별도 테스트용 인증키 사용
`;

try {
  // .env.test 파일 생성
  fs.writeFileSync(envTestPath, envTestContent);
  ('✅ .env.test 파일이 성공적으로 생성되었습니다.');
  ('📁 경로:', envTestPath);
  ('');
  ('🛡️ 안전장치 활성화:');
  ('  - 테스트 전용 DB: konnect_test');
  ('  - 운영 DB 보호: kon, konnect_dev 접근 차단');
  ('  - 테스트 전용 JWT 시크릿');
  ('');
  ('🚀 이제 npm run test:e2e 명령으로 안전하게 테스트를 실행할 수 있습니다!');
} catch (error) {
  console.error('❌ .env.test 파일 생성 실패:', error.message);
  process.exit(1);
}
