import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middlewares/logger.middelware';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';


@Module({
  imports: [
    // dotenv 전역사용
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
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
      // 직접 만들고 db에 만들때 처음에 만들때만 true로
      synchronize: false,
      extra: {
        connectionLimit: 10, // 동시 연결 수 제한
      },
    }),
    UsersModule,
    AuthModule,
    RedisModule,
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
