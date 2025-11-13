import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: any) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { identification: data.identification }] },
    });
    if (existing) throw new BadRequestException('Correo o identificación ya registrado');

    const hashed = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        lastName: data.lastName ?? '',
        identification: data.identification ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        avatarUrl: data.avatarUrl ?? null,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, lastName: true, identification: true, phone: true, address: true, avatarUrl: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: number) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async updateUser(id: number, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (data.password) data.password = await bcrypt.hash(data.password, 10);

    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.prisma.user.delete({ where: { id } });
  }
}
