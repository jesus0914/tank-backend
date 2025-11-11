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
  BadRequestException,
} from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { existsSync, mkdirSync } from 'fs';

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

  // 🔹 Obtener perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  // 🔹 Actualizar perfil y avatar
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/avatars';
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `avatar-${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Solo se permiten imágenes'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
    }),
  )
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() body: { name?: string; email?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = req.user.id;

    // Construye avatarUrl relativo para guardar en DB
    const avatarUrl = file ? `/uploads/avatars/${file.filename}` : undefined;

    // Actualiza la DB
    const updatedUser = await this.authService.updateProfile(userId, {
      ...body,
      ...(avatarUrl && { avatarUrl }),
    });

    return updatedUser;
  }
}
