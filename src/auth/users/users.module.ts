// src/auth/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileController } from './profile.controller';
import { AuthModule } from '../auth.module';

@Module({
  imports: [AuthModule],
  controllers: [UsersController,ProfileController],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}
