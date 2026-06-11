import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production' || !!process.env.LAMBDA_TASK_ROOT;

  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3308),
    username: configService.get<string>('DB_USERNAME', 'root'),
    password: configService.get<string>('DB_PASSWORD', 'secret'),
    database: configService.get<string>('DB_DATABASE', 'ecommerce_db'),
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: true, 

    // PERBAIKAN: Menggunakan opsi SSL yang lebih fleksibel
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: false, // Menghindari error sertifikat tidak dikenal di serverless
    },
  };
};