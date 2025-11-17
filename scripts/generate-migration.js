#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 사용자가 제공한 마이그레이션 이름 가져오기 (선택적)
const migrationName = process.argv[2];

// migrations 디렉토리 경로
const migrationsDir = path.join(__dirname, '..', 'src', 'migrations');

// migrations 디렉토리가 없으면 생성
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// 마이그레이션 이름이 제공되지 않으면 자동 생성
let finalMigrationPath;
if (!migrationName) {
  // 타임스탬프 기반으로 자동 이름 생성
  const timestamp = Date.now();
  finalMigrationPath = path.join(migrationsDir, `Migration${timestamp}`);
  console.log(`📝 마이그레이션 이름이 제공되지 않아 자동으로 생성합니다: Migration${timestamp}`);
} else {
  // 사용자가 제공한 이름 사용 (경로가 포함되어 있지 않으면 자동으로 추가)
  if (migrationName.includes('/') || migrationName.includes('\\')) {
    finalMigrationPath = path.resolve(process.cwd(), migrationName);
  } else {
    finalMigrationPath = path.join(migrationsDir, migrationName);
  }
  console.log(`📝 마이그레이션 생성: ${path.basename(finalMigrationPath)}`);
}

// 상대 경로로 변환 (TypeORM이 인식할 수 있도록)
const relativePath = path.relative(process.cwd(), finalMigrationPath);

console.log(`🚀 마이그레이션 파일 생성 중...`);
console.log(`📁 경로: ${relativePath}`);

try {
  // TypeORM migration:generate 명령 실행
  const command = `cross-env NODE_ENV=development ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -d ./dataSource.ts ${relativePath}`;
  
  execSync(command, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  
  console.log(`✅ 마이그레이션 파일이 성공적으로 생성되었습니다!`);
} catch (error) {
  console.error(`❌ 마이그레이션 생성 실패:`, error.message);
  process.exit(1);
}

