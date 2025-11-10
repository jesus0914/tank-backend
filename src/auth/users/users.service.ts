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
