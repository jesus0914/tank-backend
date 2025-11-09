import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { TanksService } from './tanks.service';
import { CreateTankDto } from './dto/create-tank.dto';

// 🔒 Guards
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

// 👑 Roles
import { Roles } from '../auth/decorators/roles.decorator';

// 👤 Decorator para obtener usuario logueado
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('tanks')
@UseGuards(JwtAuthGuard, RolesGuard) // Protege todos los endpoints con JWT y roles
export class TanksController {
  constructor(private readonly tanksService: TanksService) {}

  // 📋 Listar todos los tanques (todos los usuarios logueados)
  @Get()
  getAll(@GetUser() user: any) {
    // Si agregas ownerId en Tank, puedes filtrar por usuario: user.id
    return this.tanksService.getAllTanks();
  }

  // 🔍 Buscar tanques por nombre
  @Get('search')
  search(@Query('name') name: string) {
    return this.tanksService.findByName(name);
  }

  // ⏱️ Revisar manualmente tanques offline
  @Get('check-offline')
  async manualCheckOffline() {
    return this.tanksService.checkOfflineTanks();
  }

  // 📜 Historial de todos los tanques
  @Get('history/all')
  getAllHistory() {
    return this.tanksService.getAllHistory();
  }

  // 📜 Historial de un tanque específico
  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.tanksService.getTankHistory(Number(id));
  }

  // 🔎 Obtener tanque por ID
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.tanksService.getTankById(Number(id));
  }

  // ➕ Crear tanque (solo ADMIN)
  @Post()
  @Roles('ADMIN')
  create(@Body() data: CreateTankDto & { tankId?: number }) {
    return this.tanksService.createTank(data);
  }

  // ⚡ Upsert (crear o actualizar tanque) (solo ADMIN)
  @Post('upsert')
  @Roles('ADMIN')
  upsert(@Body() data: CreateTankDto & { tankId: number }) {
    return this.tanksService.upsertTank(data);
  }

  // ✏️ Actualizar tanque (solo ADMIN)
  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() data: Partial<CreateTankDto>) {
    return this.tanksService.updateTank(Number(id), data);
  }

  // ❌ Eliminar tanque (solo ADMIN)
  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.tanksService.deleteTank(Number(id));
  }
}
