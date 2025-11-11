import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // ✅ Importante

async function bootstrap() {
  // ✅ Usa NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ✅ Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Servir archivos estáticos (IMPORTANTE)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API corriendo en http://0.0.0.0:${port}`);
}
bootstrap();
