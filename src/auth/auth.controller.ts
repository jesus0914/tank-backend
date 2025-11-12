import { Controller, Get, Patch, UseGuards, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Obtener perfil
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const userId = req.user?.sub;
    return this.authService.getProfile(userId);
  }

  // Actualizar perfil
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Req() req,
    @Body() data: { name?: string; email?: string; avatarUrl?: string },
  ) {
    const userId = req.user?.sub;
    return this.authService.updateProfile(userId, data);
  }
}
