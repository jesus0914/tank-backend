import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Seguridad básica HTTP headers
  app.use(helmet());

  app.enableCors();
  
  // Puerto dinámico (útil en Railway)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 API corriendo en http://localhost:${port}`);
}
bootstrap();
