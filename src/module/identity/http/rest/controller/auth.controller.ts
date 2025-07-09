import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '@src/module/identity/core/service/authentication.service';
import { SignInRequestDto } from '../dto/request/sign-in-request.dto';
import { SignInResponseDto } from '../dto/response/sign-in-response.dto';

@Controller('identity/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() { email, password }: SignInRequestDto
  ): Promise<SignInResponseDto> {
    return await this.authService.signIn(email, password);
  }
}
