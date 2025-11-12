import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Obtener todos los usuarios
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // Obtener un usuario por ID
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

  // Actualizar usuario con manejo de errores
  async updateUser(
    id: number,
    data: { name?: string; email?: string; avatarUrl?: string }
  ) {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Validar email duplicado
      if (data.email) {
        const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (exists && exists.id !== id) {
          throw new BadRequestException('Email ya registrado');
        }
      }

      // Asegurar URL absoluta del avatar
      let avatarUrl = data.avatarUrl;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        avatarUrl = `${baseUrl}${avatarUrl}`;
      }

      // Actualizar el usuario
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
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error; // Re-lanzar errores conocidos
      }
      throw new InternalServerErrorException('No se pudo actualizar el usuario');
    }
  }

  // Obtener usuarios filtrando por rol
  async getUsersByRole(role: string) {
    if (!(role in UserRole)) {
      throw new BadRequestException(`Rol inválido: ${role}`);
    }

    return this.prisma.user.findMany({
      where: { role: UserRole[role as keyof typeof UserRole] },
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
}
