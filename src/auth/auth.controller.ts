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

  // Registro de usuario
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    const role: UserRole = dto.role ?? UserRole.USER;
    return this.authService.register(dto.email, dto.password, dto.name, role);
  }

  // Login de usuario
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto.email, dto.password);
  }

  // Obtener perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.authService.getProfile(req.user.id);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

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

    // Construir URL absoluta del avatar
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const avatarUrl = file ? `/uploads/avatars/${file.filename}` : undefined;

    // Actualizar datos en la DB
    const updatedUser = await this.authService.updateProfile(userId, {
      ...body,
      ...(avatarUrl && { avatarUrl }),
    });

    return {
      ...updatedUser,
      avatarUrl: updatedUser.avatarUrl
        ? `${baseUrl}${updatedUser.avatarUrl.startsWith('/') ? '' : '/'}${updatedUser.avatarUrl}?t=${Date.now()}`
        : null,
    };
  }
}
