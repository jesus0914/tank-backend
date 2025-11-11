import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  UploadedFile,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    const role: UserRole = dto.role ?? UserRole.USER;
    return this.authService.register(dto.email, dto.password, dto.name, role);
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto.email, dto.password);
  }

  // Obtener perfil
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.authService.getProfile(req.user.id);
    const baseUrl = process.env.BASE_URL || 'https://tank-backend-production.up.railway.app';
    return {
      ...user,
      avatarUrl: user.avatarUrl
        ? `${baseUrl}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`
        : null,
    };
  }

  // Actualizar perfil y avatar
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_, file, cb) => {
          const uniqueName = `avatar-${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() body: { name?: string; email?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;
    const avatarUrl = file ? `/uploads/avatars/${file.filename}` : undefined;

    const updatedUser = await this.authService.updateProfile(userId, {
      ...body,
      ...(avatarUrl && { avatarUrl }),
    });

    // Normalizar URL absoluta para frontend
    const baseUrl = process.env.BASE_URL || 'https://tank-backend-production.up.railway.app';
    return {
      ...updatedUser,
      avatarUrl: updatedUser.avatarUrl
        ? `${baseUrl}${updatedUser.avatarUrl.startsWith('/') ? '' : '/'}${updatedUser.avatarUrl}`
        : null,
    };
  }
}
