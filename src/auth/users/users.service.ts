import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Obtener usuario por ID
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
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

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // Actualizar usuario
  async updateUser(
    id: number,
    data: { name?: string; email?: string; avatarUrl?: string }
  ) {
    try {
      const existingUser = await this.prisma.user.findUnique({ where: { id } });
      if (!existingUser) throw new NotFoundException('Usuario no encontrado');

      // Validar email duplicado
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (emailExists && emailExists.id !== id) {
          throw new BadRequestException('Email ya registrado');
        }
      }

      // URL absoluta para avatar
      let avatarUrl = data.avatarUrl;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        avatarUrl = `${baseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          name: data.name ?? existingUser.name,
          email: data.email ?? existingUser.email,
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

      return updatedUser;
    } catch (error) {
      console.error('Error en updateUser:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('No se pudo actualizar el usuario');
    }
  }

  // Obtener todos los usuarios
  async getAllUsers() {
    return this.prisma.user.findMany({
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

  // Obtener usuarios filtrando por rol
  async getUsersByRole(role: string) {
    // Validar que el rol exista en el enum UserRole
    const validRoles = ['USER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Rol inválido: ${role}`);
    }

    return this.prisma.user.findMany({
      where: { role: role as 'USER' | 'ADMIN' },
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
