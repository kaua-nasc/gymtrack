import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserModel } from '@src/module/identity/core/model/user.model';
import { UserManagementService } from '@src/module/identity/core/service/user-management.service';
import {
  AuthenticatedRequest,
  AuthGuard,
} from '@src/module/identity/http/graphql/guard/auth.guard';
import { CreateUserInput } from '@src/module/identity/http/graphql/type/create-user-input.type';
import { User } from '@src/module/identity/http/graphql/type/user.type';

@Resolver()
export class UserResolver {
  constructor(private readonly userManagementService: UserManagementService) {}
  @Mutation(() => User)
  async createUser(
    @Args('CreateUserInput') createUserInput: CreateUserInput
  ): Promise<UserModel> {
    const user = await this.userManagementService.create(createUserInput);
    return user;
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async getProfile(
    @Context('req')
    req: AuthenticatedRequest
  ): Promise<UserModel> {
    return req.user;
  }
}
