import './plugins';
import { NestFactory } from '@nestjs/core';
// import * as fs from 'fs';
// import * as jsonfile from 'jsonfile';
// import * as path from 'path';
import { AppModule } from './app.module';
import { AppService } from './app.service';

(async () => {


  let httpsOptions;


  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
    httpsOptions,
  });

  await app.get(AppService)?.init(app);
})();
