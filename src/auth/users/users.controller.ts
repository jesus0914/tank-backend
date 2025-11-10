// src/auth/users/users.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { GetUsersDto } from './dto/get-users.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Listar usuarios (filtro opcional por rol)
  @Get()
  @Roles('ADMIN')
  async getUsers(@Query() query: GetUsersDto) {
    if (query.role) {
      return this.usersService.getUsersByRole(query.role);
    }
    return this.usersService.getAllUsers();
  }
}
