import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { TanksModule } from '../tanks/tanks.module';

@Module({
  imports: [TanksModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
