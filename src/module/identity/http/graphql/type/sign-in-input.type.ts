import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class SignInInput {
  @IsEmail()
  @Field()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Field()
  password: string;
}
