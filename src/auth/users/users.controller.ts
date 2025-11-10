// src/auth/users/users.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🔒 Solo usuarios ADMIN pueden listar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  getAll(@Query('role') role?: string) {
    if (role) {
      return this.usersService.getUsersByRole(role);
    }
    return this.usersService.getAllUsers();
  }
}
