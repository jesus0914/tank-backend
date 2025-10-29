import { Injectable, Logger } from '@nestjs/common';
import { TanksService } from 'src/tanks/tanks.service';
import { CreateTankDto } from 'src/tanks/dto/create-tank.dto';
import * as mqtt from 'mqtt';
import 'dotenv/config';

@Injectable()
export class MqttService {
  private readonly logger = new Logger(MqttService.name);
  private client: mqtt.MqttClient;

  constructor(private tanksService: TanksService) {
    const host = process.env.MQTT_HOST;
    const port = process.env.MQTT_PORT;
    const user = process.env.MQTT_USER;
    const pass = process.env.MQTT_PASS;

    this.client = mqtt.connect(`mqtts://${host}:${port}`, {
      username: user,
      password: pass,
      rejectUnauthorized: false,
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Conectado a MQTT');
      this.client.subscribe('tank/level', () =>
        this.logger.log('📡 Suscrito al topic tank/level'),
      );
    });

    this.client.on('message', async (topic, message) => {
      try {
        const data: CreateTankDto = JSON.parse(message.toString());
        this.logger.log('📥 Datos recibidos del sensor: ' + JSON.stringify(data));

        // ⚡ Guardar o actualizar tanque en DB
        await this.tanksService.upsertTank(data);
      } catch (err) {
        this.logger.error('❌ Error procesando mensaje MQTT', err);
      }
    });
  }
}
