import { MentoringReservation, MentoringSchedule, MentoringSession, Users } from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';

@Module({
    imports: [TypeOrmModule.forFeature([MentoringSession, MentoringReservation, MentoringSchedule, Users])],
    providers: [ReservationService],
    controllers: [ReservationController],
    exports: [ReservationService],
})
export class ReservationModule {}
