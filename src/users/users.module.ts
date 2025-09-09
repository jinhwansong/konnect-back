import {
  MentoringReservation,
  Payment,
  SocialAccount,
  Users,
} from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PaymentService } from '@/payment/payment.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      SocialAccount,
      Payment,
      MentoringReservation,
    ]),
    HttpModule,
  ],
  providers: [UsersService, PaymentService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
