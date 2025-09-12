import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@/users/users.module';
import { RedisModule } from '@/redis/redis.module';
import { MailService } from '@/mail/mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialAccount } from '@/entities';

@Module({
  imports: [
    UsersModule,
    RedisModule,
    TypeOrmModule.forFeature([SocialAccount]),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
