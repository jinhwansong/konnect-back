import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './article/article.module';
import { AuthModule } from './auth/auth.module';
import { MentoringModule } from './mentoring/mentoring.module';
import { MentorsModule } from './mentors/mentors.module';
import { LoggerMiddleware } from './middlewares/logger.middelware';
import { PaymentModule } from './payment/payment.module';
import { RedisModule } from './redis/redis.module';
import { ReservationModule } from './reservation/reservation.module';
import { ReviewModule } from './review/review.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SessionModule } from './session/session.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ListenerModule } from './listener/listener.module';
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
const dbDatabase = process.env.DB_DATABASE || 'konnect';

if (isTestEnv) {
  // 테스트 환경에서는 반드시 konnect_test DB만 사용
  if (!dbDatabase.includes('test') && dbDatabase !== 'konnect_test') {
    throw new Error(
      `❌ 테스트 환경에서는 테스트 DB만 사용 가능합니다. 현재 DB: ${dbDatabase}. `.repeat(3) +
      `테스트용 DB 설정을 확인해주세요.`
    );
  }
} else {
  // 운영/개발 환경에서는 test DB 접근 방지
  if (dbDatabase.includes('test')) {
    throw new Error(
      `❌ 운영/개발 환경에서는 테스트 DB 접근이 금지됩니다. 현재 DB: ${dbDatabase}. `.repeat(3)
    );
  }
}

@Module({
  imports: [
    // dotenv 전역사용
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isTestEnv ? '.env.test' : '.env',
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: isTestEnv ? 'konnect_test' : 'konnect',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: dbDatabase,
      logging: process.env.NODE_ENV === 'production' ? false : true,
      // 마이그레이션
      migrations: [join(__dirname, './migrations/**/*{.ts,.js}')],
      migrationsRun: process.env.NODE_ENV === 'production' ? false : true,
      migrationsTableName: 'migrations',
      // 이모티콘을 사용하기 위해 쓰는거
      charset: 'utf8mb4_general_ci',
      // 연결유지
      autoLoadEntities: true,
      retryAttempts: 3,
      retryDelay: 3000,
      // 테스트 환경에서는 synchronize 활성화
      synchronize: isTestEnv ? true : false,
      dropSchema: isTestEnv ? true : false, // 테스트에서만 스키마 삭제
      extra: {
        connectionLimit: isTestEnv ? 5 : 10, // 테스트에서는 연결 수 제한
      },
    }),
    UsersModule,
    AuthModule,
    RedisModule,
    MentorsModule,
    AdminModule,
    MentoringModule,
    ScheduleModule,
    ReservationModule,
    PaymentModule,
    SchedulerModule,
    ReviewModule,
    ArticleModule,
    SessionModule,
    MailModule,
    ChatModule,
    ListenerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}