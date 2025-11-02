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
    // CRÍTICO: Usar una URL completa de una sola variable para el despliegue
    const brokerUrl = process.env.MQTT_BROKER_URL;

    // Si la URL del broker no está definida, no intentamos conectar
    if (!brokerUrl) {
        this.logger.error('❌ MQTT_BROKER_URL no está definida. La funcionalidad MQTT no estará activa.');
        return;
    }

    // El cliente de MQTT puede parsear el usuario, contraseña, host y puerto de la URL
    this.client = mqtt.connect(brokerUrl, {
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
