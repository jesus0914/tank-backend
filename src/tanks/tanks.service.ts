import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TanksService {
  private readonly logger = new Logger(TanksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 🧱 Crear un tanque nuevo
  async createTank(data: any) {
    return this.prisma.tank.create({
      data: {
        id: data.tankId,
        name: data.name || `Tanque ${data.tankId}`,
        level: data.level ?? 0,
        liters: data.liters ?? 0,
        fills: data.fills ?? 0,
        online: data.online ?? false,
      },
    });
  }

  // ♻️ Actualizar un tanque existente
  async updateTank(id: number, data: any) {
    try {
      return await this.prisma.tank.update({
        where: { id },
        data,
      });
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
      tank = await this.prisma.tank.update({
        where: { id: data.tankId },
        data: {
          name: data.name,
          level: data.level,
          liters: data.liters,
          fills: data.fills ?? 0,
          online: data.online ?? true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        tank = await this.createTank(data);
        this.logger.log(`🆕 Tanque creado automáticamente con id ${data.tankId}`);
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

  // ⚙️ Revisión automática → marca tanques fuera de línea si no se actualizan en > 2 min
  @Cron(CronExpression.EVERY_MINUTE)
  async checkOfflineTanks() {
    this.logger.log('🕐 Revisión automática de tanques iniciada...');
    const tanks = await this.prisma.tank.findMany();
    const now = new Date();

    for (const tank of tanks) {
      const diffMinutes =
        (now.getTime() - new Date(tank.updatedAt).getTime()) / 60000;

      if (diffMinutes > 2 && tank.online) {
        await this.prisma.tank.update({
          where: { id: tank.id },
          data: { online: false },
        });
        this.logger.warn(`⚠️ Tanque ${tank.id} marcado como fuera de línea`);
      }
    }
  }
}
