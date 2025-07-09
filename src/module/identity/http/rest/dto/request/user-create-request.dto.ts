import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserCreateRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
}
