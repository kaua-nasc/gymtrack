import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../../persistence/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { EmailService } from '@src/module/shared/module/email/service/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  async signIn(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOneByEmail(email);

    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new UnauthorizedException(`cannot authorize user: ${email}`);
    }

    const payload = {
      sub: user.id,
    };

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
    const user = await this.userRepository.findOneByEmail(email);

    if (!user) {
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
    const user = await this.userRepository.findOneByEmail(data.email);

    if (!user) {
      throw new NotFoundException(`cannot authorize user: ${data.email}`);
    }

    const token = await this.userRepository.findResetCode(data.email);

    if (data.token !== token?.toString()) {
      throw new BadRequestException('token does not match');
    }

    await this.userRepository.removeResetCode(data.email);
  }

  async changePasswordByReset(data: {
    newPassword: string;
    userId: string;
  }): Promise<void> {
    const user = await this.userRepository.findOneById(data.userId);

    if (!user || (await this.comparePassword(data.newPassword, user.password))) {
      throw new UnauthorizedException(`cannot authorize user: ${data.newPassword}`);
    }

    user.password = data.newPassword;

    await this.userRepository.save(user);
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
