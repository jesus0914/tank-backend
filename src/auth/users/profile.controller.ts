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
  InternalServerErrorException, 
  NotFoundException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Express } from 'express';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';

@Controller('auth')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request & { user: { id: number } }) {
    return this.usersService.getUserById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/avatars';
        if (!existsSync(uploadPath)) mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
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
    }
  }))
  async updateProfile(
    @Req() req: Request & { user: { id: number } },
    @Body() data: { name?: string; email?: string; avatarUrl?: string },
    @UploadedFile() avatar?: Express.Multer.File
  ) {
    try {
      if (avatar) {
        data.avatarUrl = `/uploads/avatars/${avatar.filename}`;
      }
      const updatedUser = await this.usersService.updateUser(req.user.id, data);
      if (!updatedUser) throw new NotFoundException('Usuario no encontrado');
      return updatedUser;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw new InternalServerErrorException('No se pudo actualizar el perfil');
    }
  }
}
