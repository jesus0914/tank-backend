// src/auth/users/users.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
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
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    async updateUser(
      id: number,
      data: { name?: string; email?: string; avatarUrl?: string }
    ) {
      // Validar email
      if (data.email) {
        const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (exists && exists.id !== id) throw new BadRequestException('Email ya registrado');
      }

      return this.prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          avatarUrl: data.avatarUrl, // ✅ agregar campo avatarUrl
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true, // ✅ incluir para que frontend lo reciba
        },
      });
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
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
