import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}
  async sendCode(email: string, code: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '이메일 인증 코드',
      template: 'verification',
      context: {
        code,
      },
    });
  }
}
