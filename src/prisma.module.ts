import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Esto permite que otros módulos accedan a PrismaService sin importarlo explícitamente
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // exporta para otros módulos
})
export class PrismaModule {}
