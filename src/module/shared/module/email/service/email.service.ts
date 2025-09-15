import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailMessageDto } from '../dto/email-message.dto';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'test@email.com', pass: 'aaaa bbbb cccc dddd' },
  });

  async sendEmail(message: EmailMessageDto) {
    await this.transporter.sendMail({
      from: '"Meu App" <test@email.com>',
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}
