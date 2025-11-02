import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // CRÍTICO: Usar una variable para el puerto.
  const port = process.env.PORT || 3000;
  
  // Escuchar en el puerto detectado y en todas las interfaces ('0.0.0.0')
  await app.listen(port, '0.0.0.0');

  // Ahora el log siempre mostrará el puerto correcto (3000 local, 8080 en Railway)
  console.log(`🚀 API corriendo en http://0.0.0.0:${port}`);
}
bootstrap();
