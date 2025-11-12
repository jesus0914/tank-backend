import {
  Controller,
  Patch,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Actualizar perfil del usuario (nombre, email, avatar)
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateProfile(
    @UploadedFile() avatar: Express.Multer.File,
    @Body() body: { name?: string; email?: string },
    @Req() req: Request,
  ) {
    // 🔹 Type assertion: decimos que req.user es JwtPayload
    const user = req.user as JwtPayload;
    const userId = user.sub;

    const data: any = { ...body };

    if (avatar) {
      data.avatarUrl = `/uploads/avatars/${avatar.filename}`;
    }

    // Llamamos al servicio para actualizar en DB
    const updatedProfile = await this.authService.updateProfile(userId, data);

    return updatedProfile;
  }
}
