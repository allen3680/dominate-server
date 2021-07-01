import { INestApplication, Injectable } from '@nestjs/common';
import * as IORedis from 'ioredis';
import { RedisService } from 'nestjs-redis';
import { ConfigService } from './core';
import { ConfigType, ServerConfig } from './models';
import { MiningService } from './service';

@Injectable()
export class AppService {
  get serverConfig(): ServerConfig {
    return this.configService.get<ServerConfig>(ConfigType.Server);
  }

  get redis(): IORedis.Redis {
    return this.redisService.getClient();
  }

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
    private miningService: MiningService
  ) { }

  async init(app: INestApplication): Promise<void> {
    if (!app) {
      return;
    }

    const { port, globalPrefix } = this.serverConfig;

    this.miningService.initCronJob();

    // app.use(bodyParser.json({ limit: '50mb' }));
    // app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    // 套用 Server 設定
    app.setGlobalPrefix(globalPrefix || '');
    await app.listen(process.env.PORT || port || 8120);
  }
}
