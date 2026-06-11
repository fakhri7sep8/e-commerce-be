import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Konfigurasi TypeORM untuk koneksi MySQL
 * Data diambil dari environment variable (file .env)
 */
export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 3308),
  username: configService.get<string>('DB_USERNAME', 'root'),
  password: configService.get<string>('DB_PASSWORD', 'secret'),
  database: configService.get<string>('DB_DATABASE', 'ecommerce_db'),
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  synchronize: true, // untuk development: auto-sync schema
});