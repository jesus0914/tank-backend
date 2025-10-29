import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TanksService {
  constructor(private readonly prisma: PrismaService) {}

  // 🧱 Crear un tanque nuevo
  async createTank(data: any) {
    return this.prisma.tank.create({
      data: {
        id: data.tankId,
        name: data.name || `Tanque ${data.tankId}`,
        level: data.level || 0,
        liters: data.liters || 0,
        fills: data.fills || 0,
        online: data.online ?? true,
      },
    });
  }

  // ♻️ Actualizar un tanque
  async updateTank(id: number, data: any) {
    const tank = await this.prisma.tank.update({
      where: { id },
      data,
    });
    if (!tank) throw new NotFoundException('Tanque no encontrado');
    return tank;
  }

  // ❌ Eliminar tanque
  async deleteTank(id: number) {
    return this.prisma.tank.delete({ where: { id } });
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
          fills: data.fills,
          online: data.online,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        tank = await this.createTank(data);
        console.log(`🆕 Tanque creado automáticamente con id ${data.tankId}`);
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
        fills: data.fills,
      },
    });

    return tank;
  }

  // 🔄 Actualizar el estado online de un tanque
  async updateTankStatus(id: number) {
    const tank = await this.prisma.tank.findUnique({ where: { id } });
    if (!tank) throw new NotFoundException(`Tanque con ID ${id} no encontrado`);

    const now = new Date();
    const lastUpdate = tank.updatedAt;
    const diffInMinutes = (now.getTime() - lastUpdate.getTime()) / 60000;

    const online = diffInMinutes < 5; // Online si actualizó en los últimos 5 minutos

    await this.prisma.tank.update({
      where: { id },
      data: { online },
    });

    return online;
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

  // 🔎 Buscar por nombre
  async findByName(name: string) {
    return this.prisma.tank.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' },
      },
      include: { tankHistory: true },
    });
  }
}
