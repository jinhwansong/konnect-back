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
import { NotificationController } from './notification/notification.controller';
import { NotificationModule } from './notification/notification.module';
import { FcmModule } from './fcm/fcm.module';
import { ChatModule as RealtimeChatModule } from './realtime/chat/chat.module';
import { WebRTCModule } from './realtime/webrtc/webrtc.module';

@Module({
  imports: [
    // dotenv 전역사용
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: 'konnect',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
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
      synchronize: false,
      extra: {
        connectionLimit: 10,
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
    NotificationModule,
    FcmModule,
    ChatModule,
    WebRTCModule,
    RealtimeChatModule,
  ],
  controllers: [AppController, NotificationController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
