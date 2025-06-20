import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class LoginUserRequestDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsStrongPassword()
  password: string;
}
