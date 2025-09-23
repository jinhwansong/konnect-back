import { Mentors, Users } from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NotificationModule } from '@/notification/notification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Mentors]), NotificationModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
