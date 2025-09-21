#!/usr/bin/env ts-node

import { AppDataSource } from '../dataSource';
import * as dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

async function checkEntities() {
  console.log('🔍 Entities 확인 시작...');
  
  try {
    // DataSource 초기화
    await AppDataSource.initialize();
    console.log('✅ DataSource 초기화 성공');
    
    // Entity 메타데이터 확인
    const entityMetadatas = AppDataSource.entityMetadatas;
    console.log(`📊 발견된 Entity 개수: ${entityMetadatas.length}`);
    
    if (entityMetadatas.length === 0) {
      console.log('❌ Entity가 발견되지 않았습니다!');
      console.log('📁 현재 entities 경로:', AppDataSource.options.entities);
      return;
    }
    
    // Entity 목록 출력
    console.log('\n📋 발견된 Entity 목록:');
    entityMetadatas.forEach((metadata, index) => {
      console.log(`  ${index + 1}. ${metadata.name} (${metadata.tableName})`);
    });
    
    // 현재 스키마와 비교
    console.log('\n🔍 현재 DB 스키마 확인...');
    const tables = await AppDataSource.query('SHOW TABLES');
    console.log(`📊 DB 테이블 개수: ${tables.length}`);
    
    if (tables.length > 0) {
      console.log('📋 DB 테이블 목록:');
      tables.forEach((table: any, index: number) => {
        const tableName = Object.values(table)[0];
        console.log(`  ${index + 1}. ${tableName}`);
      });
    }
    
    console.log('\n✅ Entities 확인 완료');
    
  } catch (error) {
    console.error('❌ Entities 확인 실패:', error.message);
    console.error('스택 트레이스:', error.stack);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

checkEntities();
