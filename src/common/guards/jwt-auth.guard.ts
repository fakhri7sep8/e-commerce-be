import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT untuk melindungi endpoint
 * - Override handleRequest agar pesan error lebih jelas
 * - Extend AuthGuard('jwt') dari passport
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // Jika token tidak ada atau expired
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token sudah expired, silakan login ulang');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token tidak valid');
      }
      throw new UnauthorizedException('Anda harus login terlebih dahulu');
    }
    return user;
  }
}