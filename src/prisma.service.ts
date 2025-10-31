import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_PUBLIC_URL'),
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log(`✅ Prisma conectado a ${this.configService.get<string>('DATABASE_PUBLIC_URL')}`);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
