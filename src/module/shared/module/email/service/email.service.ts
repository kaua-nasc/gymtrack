import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailMessageDto } from '../dto/email-message.dto';
import { ConfigService } from '../../config/service/config.service';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {}

  private transporter = nodemailer.createTransport({
    service: this.configService.get('email.service'),
    auth: {
      user: this.configService.get('email.auth.user'),
      pass: this.configService.get('email.auth.pass'),
    },
  });

  async sendEmail(message: EmailMessageDto) {
    await this.transporter.sendMail({
      from: `"Meu App" <${this.configService.get('email.auth.user')}>`,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}
