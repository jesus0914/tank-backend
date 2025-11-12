import { Module } from '@nestjs/common';
import { TanksService } from './tanks.service';
import { TanksController } from './tanks.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt'; // ✅ importar JwtModule
import { AuthModule } from '../auth/auth.module'; // si usas AuthService o JwtAuthGuard

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [TanksController],
  providers: [TanksService],
})
export class TanksModule {}
