import { DataSource } from 'typeorm';
import { join } from 'path';

export const testDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'konnect_test', // 테스트용 DB
  entities: [join(__dirname, '../src/entities/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../src/migrations/**/*{.ts,.js}')],
  synchronize: true, // 테스트에서는 스키마 자동 동기화
  logging: false, // 테스트에서는 로깅 비활성화
  dropSchema: true, // 테스트 시작 시 스키마 삭제
  charset: 'utf8mb4_general_ci',
  extra: {
    connectionLimit: 5,
  },
});

export default testDataSource;
