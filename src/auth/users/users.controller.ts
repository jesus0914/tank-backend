import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Put, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🧩 Crear un nuevo usuario
  @Post()
  async createUser(@Body() data: any) {
    return this.usersService.createUser(data);
  }

  // 📋 Obtener todos los usuarios
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // 👤 Obtener perfil del usuario autenticado
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    // req.user viene del token JWT decodificado
    const userId = req.user.id;
    return this.usersService.getUserById(userId);
  }

  // 🔍 Obtener usuario por ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(Number(id));
  }

  // ✏️ Actualizar usuario
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() data: any) {
    return this.usersService.updateUser(Number(id), data);
  }

  // ❌ Eliminar usuario
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }
}
