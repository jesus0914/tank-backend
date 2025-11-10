import { Controller, Get, Patch, Req, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  // 🔒 Obtener perfil del usuario conectado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getUserById(req.user.id);
  }

  // 🔒 Actualizar perfil del usuario conectado
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Req() req, @Body() data: { name?: string; email?: string }) {
    return this.usersService.updateUser(req.user.id, data);
  }
}
