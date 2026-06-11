import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let isServerCreated = false; // Penanda apakah server sudah pernah dibuat

async function bootstrapServer() {
  if (isServerCreated) return; // Jika sudah dibuat, jangan buat lagi!

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // 1. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 2. Buka Gerbang CORS Internal NestJS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://e-commerce-fe-theta.vercel.app'
    ],
    credentials: true,
  });

  await app.init();
  isServerCreated = true; // Set jadi true agar request berikutnya gak bikin ulang
}

export default async (req: any, res: any) => {
  // Tunggu sampai server benar-benar selesai di-bootstrap sekali
  await bootstrapServer();
  
  // Baru oper request-nya ke express
  server(req, res);
};