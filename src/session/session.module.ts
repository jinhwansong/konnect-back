import { MentoringReview, MentoringSession } from '@/entities';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

@Module({
    imports: [TypeOrmModule.forFeature([MentoringReview,MentoringSession])],
    controllers: [SessionController],
    providers: [SessionService],
    exports: [SessionService],
})
export class SessionModule {}
