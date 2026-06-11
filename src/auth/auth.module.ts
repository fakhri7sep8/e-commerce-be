import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from '../common';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    // TypeORM untuk repository User
    TypeOrmModule.forFeature([User]),

    // Passport untuk autentikasi JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT Module - secret dan expiry dari .env
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
