import { MentoringReservation } from '@/entities';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendCode(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '[Konnect] 이메일 인증 코드',
      template: 'verification',
      context: {
        code,
      },
    });
  }

  async sendReservationConfirmed(
    reservation: MentoringReservation,
    meetingLink: string,
  ) {
    // 멘티용
    await this.mailerService.sendMail({
      to: reservation.mentee.email,
      subject: '[Konnect] 멘토링 예약 확정 안내',
      template: './reservation-mentee',
      context: {
        menteeName: reservation.mentee.nickname,
        mentorName: reservation.session.mentor.user.nickname,
        title: reservation.session.title,
        date: reservation.date,
        start: reservation.startTime.slice(0, 5),
        end: reservation.endTime.slice(0, 5),
        meetingLink,
      },
    });
    // 멘토용
    await this.mailerService.sendMail({
      to: reservation.session.mentor.user.email,
      subject: '[Konnect] 새로운 멘토링 예약이 결제 완료되었습니다',
      template: './reservation-mentor',
      context: {
        menteeName: reservation.mentee.nickname,
        mentorName: reservation.session.mentor.user.nickname,
        title: reservation.session.title,
        date: reservation.date,
        start: reservation.startTime.slice(0, 5),
        end: reservation.endTime.slice(0, 5),
        meetingLink,
      },
    });
  }
  async sendReservationCancelledForMentor(reservation: MentoringReservation) {
    await this.mailerService.sendMail({
      to: reservation.session.mentor.user.email,
      subject: '[Konnect] 예약된 멘토링 세션이 취소되었습니다.',
      template: './reservation-refunded',
      context: {
        menteeName: reservation.mentee.nickname,
        mentorName: reservation.session.mentor.user.nickname,
        title: reservation.session.title,
        date: reservation.date,
        start: reservation.startTime.slice(0, 5),
        end: reservation.endTime.slice(0, 5),
      },
    });
  }
}
