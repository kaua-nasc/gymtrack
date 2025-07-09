import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
