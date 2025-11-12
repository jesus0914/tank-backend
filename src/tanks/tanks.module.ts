// tanks.module.ts
import { Module } from '@nestjs/common';
import { TanksService } from './tanks.service';
import { TanksController } from './tanks.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TanksController],
  providers: [TanksService],
  exports: [TanksService], // 👈 IMPORTANTE: exportarlo para que otros módulos lo usen
})
export class TanksModule {}
