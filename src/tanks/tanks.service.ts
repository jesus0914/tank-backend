import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TanksService {
  private readonly logger = new Logger(TanksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 🧱 Crear un tanque nuevo
  async createTank(data: any) {
    const tank = await this.prisma.tank.create({
      data: {
        id: data.tankId,
        name: data.name || `Tanque ${data.tankId}`,
        level: data.level ?? 0,
        liters: data.liters ?? 0,
        fills: data.fills ?? 0,
        online: data.online ?? false,
      },
    });

    this.logger.log(`🆕 Tanque creado: ${tank.name}`);
    return tank;
  }

  // ♻️ Actualizar un tanque existente
  async updateTank(id: number, data: any) {
    try {
      const tank = await this.prisma.tank.update({
        where: { id },
        data,
      });
      return tank;
    } catch {
      throw new NotFoundException('Tanque no encontrado');
    }
  }

  // ❌ Eliminar un tanque
  async deleteTank(id: number) {
    try {
      return await this.prisma.tank.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Tanque con ID ${id} no encontrado`);
    }
  }

  // ⚡ Crear o actualizar (Upsert)
  async upsertTank(data: any) {
    let tank;
    try {
      // 🟢 Si el tanque existe, se actualiza
      tank = await this.prisma.tank.update({
        where: { id: data.tankId },
        data: {
          name: data.name,
          level: data.level,
          liters: data.liters,
          fills: data.fills ?? 0,
          online: true, // 🔥 Al recibir datos, se marca como en línea
        },
      });
    } catch (error: any) {
      // 🔵 Si no existe, se crea
      if (error.code === 'P2025') {
        tank = await this.createTank({ ...data, online: true });
        this.logger.log(`🆕 Tanque creado automáticamente con ID ${data.tankId}`);
      } else {
        throw error;
      }
    }

    // Guardar histórico
    await this.prisma.tankHistory.create({
      data: {
        tankId: tank.id,
        level: data.level,
        liters: data.liters,
        fills: data.fills ?? 0,
        
      },
    });

    return tank;
  }

  // 📋 Obtener todos los tanques
  async getAllTanks() {
    return this.prisma.tank.findMany({
      include: { tankHistory: true },
    });
  }

  // 🔍 Obtener tanque por ID
  async getTankById(id: number) {
    const tank = await this.prisma.tank.findUnique({
      where: { id },
      include: { tankHistory: true },
    });
    if (!tank) throw new NotFoundException(`Tanque con ID ${id} no encontrado`);
    return tank;
  }

  // 📜 Obtener historial de un tanque
  async getTankHistory(id: number) {
    const history = await this.prisma.tankHistory.findMany({
      where: { tankId: id },
      orderBy: { createdAt: 'desc' },
    });
    if (!history.length)
      throw new NotFoundException(`Sin historial para el tanque ${id}`);
    return history;
  }

  // 📜 Obtener todo el historial
  async getAllHistory() {
    return this.prisma.tankHistory.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // 🔎 Buscar tanques por nombre
  async findByName(name: string) {
    return this.prisma.tank.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' },
      },
      include: { tankHistory: true },
    });
  }

  // ⚙️ Revisión automática → marca tanques como offline si no se actualizan en > 2 min
@Cron('*/30 * * * * *') // cada 30 segundos
async checkOfflineTanks() {
  this.logger.log('🕐 Revisión automática de tanques (cada 30s) iniciada...');
  const tanks = await this.prisma.tank.findMany();
  const now = new Date();

  for (const tank of tanks) {
    const diffSeconds =
      (now.getTime() - new Date(tank.updatedAt).getTime()) / 1000;

    // Si pasaron más de 60 segundos sin actualización → marcar offline
    if (diffSeconds > 10 && tank.online) {
      await this.prisma.tank.update({
        where: { id: tank.id },
        data: { online: false },
      });
      this.logger.warn(`⚠️ Tanque ${tank.id} fuera de línea (${diffSeconds.toFixed(0)}s sin actualización)`);
    }
  }
}
}