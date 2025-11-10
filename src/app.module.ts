import { Module, Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { TanksModule } from './tanks/tanks.module';
import { MqttModule } from './mqtt/mqtt.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './auth/users/users.module';

@Controller()
class AppController {
  @Get()
  getHello() {
    return { message: '✅ API funcionando correctamente en Railway' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TanksModule,
    MqttModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}

