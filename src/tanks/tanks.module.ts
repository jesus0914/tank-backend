import { Module } from '@nestjs/common';
import { TanksService } from './tanks.service';
import { TanksController } from './tanks.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
   imports: [
    PrismaModule,
    JwtModule, // <- asegurarte que está aquí
  ],
  controllers: [TanksController],
  providers: [TanksService, PrismaService],
  exports: [TanksService],
})
export class TanksModule {}
