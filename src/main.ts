import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// Helmet y rate-limit importando correctamente
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Seguridad básica
  app.use(helmet.default()); // usa .default si TypeScript se queja
  app.use(
    rateLimit.default({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );

  // Archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // CORS
  app.enableCors({
    origin: '*', // para producción cambia por tu dominio
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 API corriendo en http://0.0.0.0:${port}`);
}

bootstrap();
