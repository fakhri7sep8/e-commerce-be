import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { configure as serverlessExpress } from '@vendia/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Pengaturan CORS milikmu
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://e-commerce-fe-theta.vercel.app'
    ],
    credentials: true,
  });

  // 2. Middleware cookie-parser milikmu
  app.use(cookieParser());

  // 3. Global ValidationPipe milikmu
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // JIKA BERJALAN DI LOKAL (bukan serverless Vercel)
  if (!process.env.LAMBDA_TASK_ROOT && !process.env.VERCEL) {
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Aplikasi LOKAL berjalan di http://localhost:${port}`);
    return;
  }

  // JIKA BERJALAN DI VERCEL / SERVERLESS
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

// Export handler wajib untuk Vercel / Serverless
export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};

// Jalankan bootstrap otomatis jika di lokal
if (!process.env.LAMBDA_TASK_ROOT && !process.env.VERCEL) {
  bootstrap();
}