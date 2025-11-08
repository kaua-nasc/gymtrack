import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '@src/module/identity/core/service/authentication.service';
import { SignInRequestDto } from '../dto/request/sign-in-request.dto';
import { SignInResponseDto } from '../dto/response/sign-in-response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResetPasswordRequestDto } from '../dto/request/reset-password-request.dto';
import { ResetPasswordVerifyDto } from '../dto/request/reset-password-verify-request.dto';
import { ResetPasswordNewPasswordRequestDto } from '../dto/request/reset-password-new-password-request.dto';

@ApiTags('Authentication')
@Controller('identity/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autentica um usuário e retorna um token JWT',
    description:
      'Realiza login com e-mail e senha, retornando o token JWT e informações básicas do usuário.',
  })
  @ApiBody({ type: SignInRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado com sucesso.',
    type: SignInResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async signIn(
    @Body() { email, password }: SignInRequestDto
  ): Promise<SignInResponseDto> {
    return await this.authService.signIn(email, password);
  }

  @Post('reset-password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar redefinição de senha',
    description:
      'Gera e envia um código de verificação (token) para o e-mail informado, permitindo redefinir a senha posteriormente.',
  })
  @ApiBody({ type: ResetPasswordRequestDto })
  @ApiResponse({
    status: 200,
    description: 'E-mail de redefinição de senha enviado com sucesso.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  async requestResetPassword(@Body() body: ResetPasswordRequestDto): Promise<void> {
    return await this.authService.requestResetPassword({ ...body });
  }

  @Post('reset-password/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar código de redefinição de senha',
    description: 'Valida o código de verificação enviado para o e-mail do usuário.',
  })
  @ApiBody({ type: ResetPasswordVerifyDto })
  @ApiResponse({
    status: 200,
    description: 'Código de verificação válido.',
  })
  @ApiResponse({
    status: 400,
    description: 'Código inválido ou expirado.',
  })
  async verifyResetPassword(@Body() body: ResetPasswordVerifyDto): Promise<void> {
    return await this.authService.verifyResetPassword({ ...body });
  }

  @Post('reset-password/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova senha após redefinição',
    description:
      'Define uma nova senha para o usuário após a verificação bem-sucedida do código de redefinição.',
  })
  @ApiBody({ type: ResetPasswordNewPasswordRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Senha redefinida com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida.',
  })
  async changePasswordByReset(
    @Body() body: ResetPasswordNewPasswordRequestDto
  ): Promise<void> {
    return await this.authService.changePasswordByReset({ ...body });
  }
}
