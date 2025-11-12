import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(
    id: number,
    data: { name?: string; email?: string; avatarUrl?: string }
  ) {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) throw new NotFoundException('Usuario no encontrado');

      // Validar email duplicado
      if (data.email) {
        const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (exists && exists.id !== id) throw new BadRequestException('Email ya registrado');
      }

      // URL absoluta para avatar
      let avatarUrl = data.avatarUrl;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        avatarUrl = `${baseUrl}${avatarUrl}`;
      }

      return await this.prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          avatarUrl,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
        },
      });
    } catch (error) {
      console.error('Error en updateUser:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('No se pudo actualizar el usuario');
    }
  }
}
