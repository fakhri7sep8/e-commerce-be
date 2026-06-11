import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

async function createServer() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // 1. Global Validation Pipe (Biar DTO lo jalan)
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

  app.setGlobalPrefix('api');

  await app.init();
}

export default async (req: any, res: any) => {
  await createServer();
  server(req, res);
};