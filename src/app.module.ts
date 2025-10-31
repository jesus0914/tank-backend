import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TanksModule } from './tanks/tanks.module';
import { MqttModule } from './mqtt/mqtt.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),TanksModule, MqttModule],
  providers: [PrismaService],
})
export class AppModule {}
