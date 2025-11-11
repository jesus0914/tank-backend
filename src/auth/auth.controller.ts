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

  // ✅ Obtener perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const user = await this.authService.getProfile(req.user.id);

    // Usa una única variable base para todas las URLs
    const baseUrl =
      process.env.BASE_URL || 'https://tank-backend-production.up.railway.app';

    const avatarUrl = user.avatarUrl
      ? `${baseUrl}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`
      : null;

    return { ...user, avatarUrl };
  }

  // ✅ Actualizar perfil y avatar
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
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

    const baseUrl =
      process.env.BASE_URL || 'https://tank-backend-production.up.railway.app';

    return {
      ...updatedUser,
      avatarUrl: updatedUser.avatarUrl
        ? `${baseUrl}${
            updatedUser.avatarUrl.startsWith('/') ? '' : '/'
          }${updatedUser.avatarUrl}`
        : null,
    };
  }
}
