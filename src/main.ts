import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  
  // 👇 Esto es clave para que funcione en Docker
   await app.listen(process.env.PORT || 3000, '0.0.0.0');

  console.log(`🚀 API corriendo en http://0.0.0.0:${process.env.PORT}`);
}
bootstrap();
