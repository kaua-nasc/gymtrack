import { Field, ObjectType } from '@nestjs/graphql';
import { IsDateString, IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

@ObjectType()
export class User {
  @IsNotEmpty()
  @IsUUID()
  @Field()
  id: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Field()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @Field()
  email: string;

  @IsNotEmpty()
  @IsDateString()
  createdAt: Date;

  @IsNotEmpty()
  @IsDateString()
  updatedAt: Date;
}
