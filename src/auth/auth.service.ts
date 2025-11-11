import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User, UserRole } from '@prisma/client';

/**
 * Tipo exportado para que pueda usarse en controladores
 */
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

  /**
   * Registro de usuario
   */
  async register(
    email: string,
    password: string,
    name: string,
    role: UserRole = UserRole.USER
  ): Promise<AuthResponse> {
    // Validar email
    if (!email.includes('@')) throw new BadRequestException('Email inválido');
    // Validar contraseña
    if (password.length < 6) throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');

    // Verificar si ya existe usuario
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email ya registrado');

    // Hashear contraseña
    const hashed = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: { email, password: hashed, name, role },
    });

    const token = this.generateJwt({ sub: user.id, email: user.email, role: user.role });

    return { access_token: token, user };
  }

  /**
   * Login de usuario
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.generateJwt({ sub: user.id, email: user.email, role: user.role });

    return { access_token: token, user };
  }

  /**
   * Genera JWT seguro
   */
  private generateJwt(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  /**
   * Validación de usuario por ID
   */
  async validateUser(userId: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  /**
   * Verifica si un usuario tiene un rol específico
   */
  async hasRole(userId: number, role: UserRole): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    return user.role === role;
  }

  async updateProfile(
  userId: number,
  data: { name?: string; email?: string; avatarUrl?: string },
) {
  const user = await this.prisma.user.update({
    where: { id: userId },
    data,
  });

  // 🔹 Devuelve datos actualizados al frontend
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl
      ? `${process.env.BASE_URL}${user.avatarUrl}`
      : null,
  };
}

}
