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
    const brokerUrl = process.env.MQTT_BROKER_URL;

    if (!brokerUrl) {
      this.logger.error('❌ MQTT_BROKER_URL no está definida. MQTT deshabilitado.');
      return;
    }

    // ✅ Conexión MQTT
    this.client = mqtt.connect(brokerUrl, { rejectUnauthorized: false });

    this.client.on('connect', () => {
      this.logger.log('✅ Conectado a MQTT');
      this.client.subscribe('tank/level', () =>
        this.logger.log('📡 Suscrito al topic tank/level'),
      );
    });

    // ✅ Mensajes recibidos del sensor
    this.client.on('message', async (topic, message) => {
      try {
        const data: CreateTankDto = JSON.parse(message.toString());
        this.logger.log('📥 Datos recibidos del sensor: ' + JSON.stringify(data));

        // 🔁 Siempre que se reciba un mensaje, el tanque se considera ONLINE
        await this.tanksService.upsertTank({
          ...data,
          online: true,
        });
      } catch (err) {
        this.logger.error('❌ Error procesando mensaje MQTT', err);
      }
    });

    this.client.on('error', (err) => {
      this.logger.error('❌ Error de conexión MQTT', err);
    });
  }
}
