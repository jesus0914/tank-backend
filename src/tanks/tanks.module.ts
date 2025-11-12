import { Module } from '@nestjs/common';
import { TanksService } from './tanks.service';
import { TanksController } from './tanks.controller';
import { PrismaModule } from '../prisma/prisma.module'; // ✅ Importar PrismaModule
import { JwtModule } from '@nestjs/jwt'; // ✅ Importar JwtModule

@Module({
  imports: [
    PrismaModule,
    JwtModule, // o AuthModule si exporta JwtModule
  ],
  controllers: [TanksController],
  providers: [TanksService],
})
export class TanksModule {}
