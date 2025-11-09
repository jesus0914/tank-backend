import { Module, Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { TanksModule } from './tanks/tanks.module';
import { MqttModule } from './mqtt/mqtt.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Controller()
class AppController {
  @Get()
  getHello() {
    return { message: '✅ API funcionando correctamente en Railway' };
  }
}

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TanksModule, MqttModule,ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
