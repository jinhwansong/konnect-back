import { DataSource } from 'typeorm';
import { join } from 'path';
import { config } from 'dotenv';
config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT as string) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE,
  // CLI에서 entities를 정확히 찾기 위한 경로 수정
  entities: [join(__dirname, '**/*.entity.{ts,js}')],

  migrations: [join(__dirname, 'src/migrations/**/*.{ts,js}')],
  // 환경별 synchronize 설정
  synchronize: false,
  dropSchema: false,
  // 환경별 migration 설정
  migrationsRun: process.env.NODE_ENV === 'production' ? false : true,
  // 프로덕션에서만 마이그레이션 자동 실행
  migrationsTableName: 'migrations',
  logging: process.env.NODE_ENV === 'production' ? false : true, // 프로덕션에서만 로깅 비활성화 ㅎㅎ
  charset: 'utf8mb4_general_ci',
  extra: {
    connectionLimit: process.env.NODE_ENV === 'test' ? 5 : 10,
  },
});
