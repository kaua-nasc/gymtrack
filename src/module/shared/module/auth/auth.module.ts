import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ClsModule } from 'nestjs-cls';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/service/config.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => {
        console.log(
          'Registering JwtModule with secret:',
          configService.get('auth.jwtSecret')
        );
        return {
          secret: configService.get('auth.jwtSecret'),
          verifyOptions: { algorithms: ['HS256'] },
          global: true,
          signOptions: {
            expiresIn: '60m',
          },
        };
      },
    }),
  ],
  providers: [JwtAuthGuard, JwtService],
  exports: [JwtAuthGuard, JwtService],
})
export class AuthModule {}
