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
  @ApiOperation({ summary: 'Autentica um usuário e retorna um token JWT' })
  @ApiBody({ type: SignInRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Usuário autenticado com sucesso',
    type: SignInResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async signIn(
    @Body() { email, password }: SignInRequestDto
  ): Promise<SignInResponseDto> {
    return await this.authService.signIn(email, password);
  }

  @Post('reset-password/request')
  @HttpCode(HttpStatus.OK)
  async requestResetPassword(@Body() body: ResetPasswordRequestDto): Promise<void> {
    return await this.authService.requestResetPassword({ ...body });
  }

  @Post('reset-password/verify')
  @HttpCode(HttpStatus.OK)
  async verifyResetPassword(@Body() body: ResetPasswordVerifyDto): Promise<void> {
    return await this.authService.verifyResetPassword({ ...body });
  }

  @Post('reset-password/create')
  @HttpCode(HttpStatus.CREATED)
  async changePasswordByReset(
    @Body() body: ResetPasswordNewPasswordRequestDto
  ): Promise<void> {
    return await this.authService.changePasswordByReset({ ...body });
  }
}
