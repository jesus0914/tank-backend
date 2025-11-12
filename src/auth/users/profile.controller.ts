import {
  Controller,
  Get,
  Patch,
  Req,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express } from 'express';
import { Request } from 'express';

@Controller('auth')
export class ProfileController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request & { user: { id: number } }) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${(req as any).user.id}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateProfile(
    @Req() req: Request & { user: { id: number } },
    @Body() data: { name?: string; email?: string; avatarUrl?: string },
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    if (avatar) data.avatarUrl = `/uploads/avatars/${avatar.filename}`;
    return this.authService.updateProfile(req.user.id, data);
  }
}
