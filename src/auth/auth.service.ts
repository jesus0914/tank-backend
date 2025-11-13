import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    // UsersService.createUser hace la validación de duplicados
    const created = await this.usersService.createUser(dto);
    const payload = { sub: created.id, email: created.email, role: created.role };
    const access_token = this.jwtService.sign(payload);
    return { access_token, user: this.sanitize(created) };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);
    return { access_token, user: this.sanitize(user) };
  }

  sanitize(user: any) {
    const { password, ...rest } = user;
    return rest;
  }

  async getProfile(userId: number) {
    return this.sanitize(await this.usersService.getUserById(userId));
  }

  async updateProfile(userId: number, data: any) {
    const updated = await this.usersService.updateUser(userId, data);
    return this.sanitize(updated);
  }
}
