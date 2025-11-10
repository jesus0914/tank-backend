import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config'; 
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(
    {
      methods: 'GET,POST,PUT,DELETE',
      credentials: true,
    }
  );
  // Validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,             // elimina props extra no declaradas en DTO
    forbidNonWhitelisted: true,  // lanza error si envían props no permitidas
    transform: true,             // convierte tipos automáticamente (string -> enum, etc.)
  }));
  // CRÍTICO: Usar una variable para el puerto.
  const port = process.env.PORT || 3000;
  
  // Escuchar en el puerto detectado y en todas las interfaces ('0.0.0.0')
  await app.listen(port, '0.0.0.0');

  // Ahora el log siempre mostrará el puerto correcto (3000 local, 8080 en Railway)
  console.log(`🚀 API corriendo en http://0.0.0.0:${port}`);
}
bootstrap();
