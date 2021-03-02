import { ConfigModule, ConfigService } from '.';
import { Global, HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModule, RedisModuleOptions } from 'nestjs-redis';
import * as Entities from 'src/entity';
import { ConfigType } from 'src/models';

@Global()
@Module({
  imports: [
    // 註冊 ConfigModule
    ConfigModule,
    // 註冊 TypeOrmModule
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseConfig: any = config.get<TypeOrmModuleOptions>(
          ConfigType.Database,
        );

        return {
          ...databaseConfig,
          entities: Object.values(Entities),
        };
      },
    }),
    // 註冊 RedisModule
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.get<RedisModuleOptions>(ConfigType.Redis),
    }),
    // 註冊 HttpModule
    HttpModule,
  ],
  exports: [ConfigModule, TypeOrmModule, RedisModule, HttpModule],
})
export class CoreModule {}
