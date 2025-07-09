import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../persistence/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async signIn(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOneByEmail(email);

    if (!user || !(await this.comparePassword(password, user.password))) {
      throw new UnauthorizedException(`cannot authorize user: ${email}`);
    }

    const payload = {
      sub: user.id,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        algorithm: 'HS256',
      }),
    };
  }

  private async comparePassword(
    password: string,
    actualPasword: string
  ): Promise<boolean> {
    return compare(password, actualPasword);
  }
}
