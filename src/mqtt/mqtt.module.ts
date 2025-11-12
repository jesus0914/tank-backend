// mqtt.module.ts
import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { TanksModule } from '../tanks/tanks.module'; // 👈 importar el módulo que lo exporta

@Module({
  imports: [TanksModule], // 👈 necesario
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
