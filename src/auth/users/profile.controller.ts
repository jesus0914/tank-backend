import { 
  Controller, 
  Get, 
  Patch, 
  Req, 
  Body, 
  UseGuards, 
  UploadedFile, 
  UseInterceptors, 
  BadRequestException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  // 🔒 Obtener perfil del usuario conectado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getUserById(req.user.id);
  }

  // 🔒 Actualizar perfil del usuario conectado con avatar opcional
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${req.user.id}-${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return cb(new BadRequestException('Solo se permiten imágenes'), false);
      }
      cb(null, true);
    }
  }))
  async updateProfile(
    @Req() req, 
    @Body() data: { name?: string; email?: string }, 
    @UploadedFile() avatar?: Express.Multer.File
  ) {
    if (avatar) {
      data.avatarUrl = `/uploads/avatars/${avatar.filename}`;
    }
    return this.usersService.updateUser(req.user.id, data);
  }
}
