import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Notification } from '@/entities/notification.entity';
import { UserFcmToken, Users } from '@/entities';
import { FcmModule } from '@/fcm/fcm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, UserFcmToken, Users]),
    FcmModule,
  ],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
