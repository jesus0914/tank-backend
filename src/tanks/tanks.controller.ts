import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { TanksService } from './tanks.service';
import { CreateTankDto } from './dto/create-tank.dto';

@Controller('tanks')
export class TanksController {
  constructor(private readonly tanksService: TanksService) {}

  // Listar todos los tanques
  @Get()
  getAll() {
    return this.tanksService.getAllTanks();
  }

  // Obtener tanque por ID
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.tanksService.getTankById(Number(id));
  }

  // Crear un tanque
  @Post()
  create(@Body() data: CreateTankDto & { tankId?: number }) {
    return this.tanksService.createTank(data);
  }

  // Actualizar un tanque
  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CreateTankDto>) {
    return this.tanksService.updateTank(Number(id), data);
  }

  // Eliminar un tanque
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tanksService.deleteTank(Number(id));
  }

  // Upsert (crear o actualizar)
  @Post('upsert')
  upsert(@Body() data: CreateTankDto & { tankId: number }) {
    return this.tanksService.upsertTank(data);
  }

  // Obtener historial de un tanque
  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.tanksService.getTankHistory(Number(id));
  }

  // Obtener todo el historial
  @Get('history/all')
  getAllHistory() {
    return this.tanksService.getAllHistory();
  }

  // Buscar tanques por nombre
  @Get('search')
  search(@Query('name') name: string) {
    return this.tanksService.findByName(name);
  }
}
