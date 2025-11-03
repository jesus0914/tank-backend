import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { TanksService } from './tanks.service';

@WebSocketGateway({
  cors: {
    origin: '*', // ⚠️ habilita CORS según tu frontend
  },
})
export class TanksGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly tanksService: TanksService) {}

  afterInit() {
    console.log('🚀 WebSocket Gateway inicializado');
  }

  handleConnection(client: any) {
    console.log('🟢 Cliente conectado:', client.id);
  }

  handleDisconnect(client: any) {
    console.log('🔴 Cliente desconectado:', client.id);
  }

  // 📢 Emitir estado del tanque actualizado
  async emitTankUpdate(tankId: number) {
    const tank = await this.tanksService.getTankById(tankId);
    this.server.emit('tankUpdate', tank);
  }

  // 📢 Emitir todos los tanques (ej: al reconectar frontend)
  async emitAllTanks() {
    const tanks = await this.tanksService.getAllTanks();
    this.server.emit('allTanks', tanks);
  }
}
