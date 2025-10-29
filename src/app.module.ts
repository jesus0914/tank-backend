import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TanksModule } from './tanks/tanks.module';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [TanksModule, MqttModule],
  providers: [PrismaService],
})
export class AppModule {}
