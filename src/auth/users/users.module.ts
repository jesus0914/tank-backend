import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth.module';
import { PrismaService } from 'src/prisma/prisma.service';


@Module({
  imports: [forwardRef(() => AuthModule)], // 🔥 evita el mismo bucle
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
