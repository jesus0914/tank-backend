import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: {
    email: string;
    password: string;
    name: string;
    lastName?: string;
    identification?: string;
    phone?: string;
    address?: string;
    role?: UserRole;
  }) {
    const { email, password, name, lastName, identification, phone, address, role } = dto;

    // Verificar si ya existe el usuario
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('El correo electrónico ya está registrado');
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario en la base de datos
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        lastName: lastName || '',
        identification: identification || '',
        phone: phone || '',
        address: address || '',
        role: role || UserRole.USER,
      },
    });

    // Generar token JWT
    const token = await this.jwtService.signAsync({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return { message: 'Usuario registrado con éxito', token };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { message: 'Inicio de sesión exitoso', token };
  }
}
