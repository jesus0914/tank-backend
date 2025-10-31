import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = process.env.PORT || 3000;
  
  // 👇 Esto es clave para que funcione en Docker
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API corriendo en http://0.0.0.0:${port}`);
}
bootstrap();
