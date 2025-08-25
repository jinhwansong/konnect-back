import { ChatModule } from '@/chat/chat.module';
import { MailModule } from '@/mail/mail.module';
import { Module } from '@nestjs/common';
import { ChatListener } from './chat.listener';
import { MailListener } from './mail.listener';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentoringReservation } from '@/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([MentoringReservation]),
    ChatModule,
    MailModule,
  ],
  providers: [ChatListener, MailListener],
})
export class ListenerModule {}
