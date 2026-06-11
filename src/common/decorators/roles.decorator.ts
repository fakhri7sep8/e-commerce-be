import { SetMetadata } from '@nestjs/common';

// Key untuk menyimpan roles di metadata
export const ROLES_KEY = 'roles';

/**
 * Decorator @Roles('admin', 'customer')
 * Menandai endpoint yang hanya bisa diakses oleh role tertentu
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);