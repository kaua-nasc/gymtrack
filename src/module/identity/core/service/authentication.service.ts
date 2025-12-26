import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '@src/module/shared/module/email/service/email.service';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';
import { compare } from 'bcrypt';
import { UserRepository } from '../../persistence/repository/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly logger: AppLogger
  ) {}

  async signIn(email: string, password: string): Promise<{ accessToken: string }> {
    this.logger.log(`Sign-in attempt for email: ${email}`);

    const user = await this.userRepository.findOneByEmail(email);

    if (!user || !(await this.comparePassword(password, user.password))) {
      this.logger.warn(
        `Failed sign-in for email ${email}: User not found or password mismatch.`
      );
      throw new UnauthorizedException(`cannot authorize user: ${email}`);
    }

    const payload = {
      sub: user.id,
    };

    this.logger.log(`Sign-in successful for user ID: ${user.id}`);
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        algorithm: 'HS256',
      }),
    };
  }

  private async comparePassword(
    password: string,
    actualPasword: string
  ): Promise<boolean> {
    return compare(password, actualPasword);
  }

  async requestResetPassword({ email }: { email: string }): Promise<void> {
    this.logger.log(`Password reset request received for email: ${email}`);
    const user = await this.userRepository.findOneByEmail(email);

    if (!user) {
      this.logger.warn(
        `Password reset request failed: User not found for email ${email}.`
      );
      throw new NotFoundException(`cannot authorize user: ${email}`);
    }
    const code = this.generateResetCode();

    await this.userRepository.saveResetCode(code, user.email, 60 * 5);

    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Redefinição de Senha - Meu App',
      text: `Seu código de redefinição de senha é: ${code}`,
      html: htmlEmail(user.email, code),
    });

    this.logger.log(`Password reset code generated and sent for user ID: ${user.id}`);
  }

  private generateResetCode(length: number = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      code += chars[randomIndex];
    }

    return code;
  }

  async verifyResetPassword(data: { token: string; email: string }): Promise<void> {
    this.logger.log(`Verifying password reset code for email: ${data.email}`);
    const user = await this.userRepository.findOneByEmail(data.email);

    if (!user) {
      this.logger.warn(
        `Reset code verification failed: User not found for email ${data.email}.`
      );
      throw new NotFoundException(`cannot authorize user: ${data.email}`);
    }

    const token = await this.userRepository.findResetCode(data.email);

    if (data.token !== token?.toString()) {
      this.logger.warn(
        `Reset code verification failed for user ID ${user.id}: Token mismatch.`
      );
      throw new BadRequestException('token does not match');
    }

    await this.userRepository.removeResetCode(data.email);
    this.logger.log(`Reset code verified successfully for user ID: ${user.id}`);
  }

  async changePasswordByReset(data: {
    newPassword: string;
    userId: string;
  }): Promise<void> {
    this.logger.log(`Attempting password change via reset for user ID: ${data.userId}`);
    const user = await this.userRepository.findOneById(data.userId);

    if (!user || (await this.comparePassword(data.newPassword, user.password))) {
      this.logger.warn(
        `Password change failed for user ID ${data.userId}: User not found or new password is the same as old.`
      );
      throw new UnauthorizedException(`cannot authorize user: ${data.newPassword}`);
    }

    this.logger.warn(
      `Saving new password for user ID: ${data.userId}. Ensure hashing logic is in place (e.g., repository hook).`
    );
    user.password = data.newPassword;

    await this.userRepository.save(user);
    this.logger.log(`Password changed successfully for user ID: ${data.userId}`);
  }
}

const htmlEmail = (userName: string, code: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinição de Senha</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f7;
      color: #51545e;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333333;
      font-size: 24px;
      margin-bottom: 10px;
    }
    p {
      font-size: 16px;
      line-height: 1.5;
    }
    .code-box {
      margin: 20px 0;
      padding: 15px;
      font-size: 22px;
      letter-spacing: 4px;
      font-weight: bold;
      text-align: center;
      color: #ffffff;
      background-color: #4f46e5; /* azul estiloso */
      border-radius: 6px;
    }
    .footer {
      font-size: 12px;
      color: #a1a1aa;
      text-align: center;
      margin-top: 30px;
    }
    a {
      color: #4f46e5;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Redefinição de Senha</h1>
    <p>Olá ${userName},</p>
    <p>Recebemos uma solicitação para redefinir sua senha. Utilize o código abaixo para prosseguir com a redefinição:</p>
    <div class="code-box">${code}</div>
    <p>Este código é válido por <strong>5 minutos</strong>. Se você não solicitou a redefinição, por favor ignore este email.</p>
    <p>Atenciosamente,<br>Equipe Meu App</p>
    <div class="footer">
      © 2025 Meu App. Todos os direitos reservados.
    </div>
  </div>
</body>
</html>
`;
