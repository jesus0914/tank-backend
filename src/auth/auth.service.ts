import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User, UserRole } from '@prisma/client';

export interface AuthResponse {
  access_token: string;
  user: Partial<User>;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Registro
  async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = UserRole.USER,
  ): Promise<AuthResponse> {
    if (!email.includes('@')) throw new BadRequestException('Email inválido');
    if (password.length < 6) throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email ya registrado');

    const hashed = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({ data: { email, password: hashed, name, role } });

    const token = this.generateJwt({ sub: user.id, email: user.email, role: user.role });
    return { access_token: token, user };
  }

  // Login
  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.generateJwt({ sub: user.id, email: user.email, role: user.role });
    return { access_token: token, user };
  }

  // Generar JWT
  private generateJwt(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  // Actualizar perfil
  async updateProfile(
    userId: number,
    data: { name?: string; email?: string; avatarUrl?: string },
  ) {
    if (!userId) throw new UnauthorizedException('Usuario no autenticado');

    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Usuario no encontrado');

      // Validar email duplicado
      if (data.email && data.email !== user.email) {
        const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (exists) throw new ConflictException('Email ya registrado');
      }

      // URL absoluta del avatar
      let avatarUrl = data.avatarUrl;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        avatarUrl = `${baseUrl}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { ...data, avatarUrl },
      });

      return this.getProfile(userId);
    } catch (err) {
      console.error('Error updateProfile:', err);
      if (
        err instanceof BadRequestException ||
        err instanceof ConflictException ||
        err instanceof NotFoundException
      )
        throw err;
      throw new InternalServerErrorException('No se pudo actualizar el perfil');
    }
  }

  // Obtener perfil
  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
        ? `${baseUrl}${user.avatarUrl.startsWith('/') ? '' : '/'}${user.avatarUrl}`
        : null,
    };
  }
}
