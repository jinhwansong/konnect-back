#!/usr/bin/env ts-node

import { AppDataSource } from '../dataSource';
import * as dotenv from 'dotenv';

// 테스트 환경 변수 로드
dotenv.config({ path: '.env.test' });

async function setupTestSchema() {
  ('🧪 테스트 스키마 설정 시작...');

  try {
    // 테스트 환경으로 설정
    process.env.NODE_ENV = 'test';
    process.env.DB_DATABASE = 'konnect_test';

    // DataSource 초기화
    await AppDataSource.initialize();
    ('✅ 테스트 DataSource 초기화 성공');

    // 기존 스키마 삭제 (안전장치)
    ('🗑️ 기존 테스트 스키마 삭제 중...');
    await AppDataSource.dropDatabase();
    ('✅ 기존 테스트 스키마 삭제 완료');

    // 테스트 데이터베이스 생성
    ('🏗️ 테스트 데이터베이스 생성 중...');
    await AppDataSource.synchronize(true); // dropSchema: true로 스키마 재생성
    ('✅ 테스트 스키마 생성 완료');

    // Entity 메타데이터 확인
    const entityMetadatas = AppDataSource.entityMetadatas;
    `📊 생성된 Entity 개수: ${entityMetadatas.length}`;

    if (entityMetadatas.length === 0) {
      ('❌ Entity가 발견되지 않았습니다!');
      return;
    }

    // Entity 목록 출력
    ('\n📋 생성된 Entity 목록:');
    entityMetadatas.forEach((metadata, index) => {
      `  ${index + 1}. ${metadata.name} (${metadata.tableName})`;
    });

    // 테이블 확인
    ('\n🔍 생성된 테이블 확인...');
    const tables = await AppDataSource.query('SHOW TABLES');
    `📊 생성된 테이블 개수: ${tables.length}`;

    if (tables.length > 0) {
      ('📋 테이블 목록:');
      tables.forEach((table: any, index: number) => {
        const tableName = Object.values(table)[0];
        `  ${index + 1}. ${tableName}`;
      });
    }

    ('\n✅ 테스트 스키마 설정 완료!');
    ('🎯 이제 E2E 테스트를 실행할 수 있습니다.');
  } catch (error) {
    console.error('❌ 테스트 스키마 설정 실패:', error.message);

    if (
      error.message.includes('database') &&
      error.message.includes("doesn't exist")
    ) {
      ('\n💡 해결 방법:');
      ('1. MySQL에서 테스트 데이터베이스를 먼저 생성하세요:');
      ('   CREATE DATABASE konnect_test;');
      ('2. 또는 .env.test에서 기존 데이터베이스를 사용하세요');
    }

    console.error('스택 트레이스:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

setupTestSchema();
