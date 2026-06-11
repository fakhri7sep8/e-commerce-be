import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard untuk mengecek role user
 * - Ambil roles yang dibutuhkan dari @Roles() decorator
 * - Bandingkan dengan role user dari JWT
 * - Jika tidak ada @Roles() di endpoint → semua user boleh akses
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Ambil roles dari metadata (dari @Roles() decorator)
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Jika tidak ada @Roles() di endpoint → boleh akses
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Ambil data user dari request (di-set oleh JwtAuthGuard / JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // Cek apakah role user termasuk dalam requiredRoles
    const hasRole = requiredRoles.includes(user?.role);
    if (!hasRole) {
      throw new ForbiddenException('Anda tidak memiliki akses ke resource ini');
    }

    return true;
  }
}