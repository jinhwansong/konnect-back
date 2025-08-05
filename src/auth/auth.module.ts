import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '@/users/users.module';
import { RedisModule } from '@/redis/redis.module';
import { MailService } from '@/mail/mail.service';

@Module({
  imports: [UsersModule, RedisModule],
  controllers: [AuthController],
  providers: [AuthService, MailService],
  exports: [AuthService],
})
export class AuthModule {}
