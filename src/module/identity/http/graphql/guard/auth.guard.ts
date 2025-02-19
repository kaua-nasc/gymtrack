import {
  CanActivate,
  ContextType,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { GetUserUseCase } from '@src/module/identity/application/use-case/get-user.use-case';
import { UserModel } from '@src/module/identity/core/model/user.model';
import { jwtConstants } from '@src/module/identity/core/service/authentication.service';
import { UserManagementService } from '@src/module/identity/core/service/user-management.service';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: UserModel;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userManagementService: UserManagementService,
    private readonly getUserUseCase: GetUserUseCase
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await this.getRequest(context);
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const user = await this.getUserUseCase.execute(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }
      request.user = user;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
  private async getRequest(context: ExecutionContext): Promise<AuthenticatedRequest> {
    try {
      if (context.getType<ContextType | 'graphql'>() === 'graphql') {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;
        return req as AuthenticatedRequest;
      }
      const req = context.switchToHttp().getRequest<AuthenticatedRequest>();

      return req;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.get('Authorization')?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
