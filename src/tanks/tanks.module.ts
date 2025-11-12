import { Module } from '@nestjs/common';
import { TanksService } from './tanks.service';
import { TanksController } from './tanks.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TanksController],
  providers: [TanksService, PrismaService],
  exports: [TanksService],
})
export class TanksModule {}
