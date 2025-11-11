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
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const role: UserRole = dto.role ?? UserRole.USER;
    return this.authService.register(dto.email, dto.password, dto.name, role);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
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
    const avatarUrl = file ? `/uploads/avatars/${file.filename}` : undefined;
    return this.authService.updateProfile(req.user.id, {
      ...body,
      ...(avatarUrl && { avatarUrl }),
    });
  }
}
