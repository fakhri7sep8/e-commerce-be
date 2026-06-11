import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS untuk frontend di http://localhost:3000
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Middleware cookie-parser untuk membaca cookies
  app.use(cookieParser());

  // Global ValidationPipe - whitelist: true otomatis strip properti yang tidak didekorasi
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Jalankan di port dari environment variable PORT, default 3001
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Aplikasi berjalan di http://localhost:${port}`);
}
bootstrap();