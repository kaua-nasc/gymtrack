import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailMessageDto } from '../dto/email-message.dto';
import { ConfigService } from '../../config/service/config.service';
import { AppLogger } from '../../logger/service/app-logger.service';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      auth: {
        user: this.configService.get('email.auth.user'),
        pass: this.configService.get('email.auth.pass'),
      },
    });
  }

  async sendEmail(message: EmailMessageDto) {
    this.logger.log(
      `Attempting to send email to ${message.to} with subject: ${message.subject}`
    );
    try {
      const info = await this.transporter.sendMail({
        from: `"Meu App" <${this.configService.get('email.auth.user')}>`,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      this.logger.log(
        `Email sent successfully to ${message.to}. MessageId: ${info.messageId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${message.to}`,
        error instanceof Error ? error.stack : undefined,
        'EmailService'
      );
      throw error;
    }
  }
}
