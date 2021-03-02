import './plugins';
import { NestFactory } from '@nestjs/core';
// import * as fs from 'fs';
// import * as jsonfile from 'jsonfile';
// import * as path from 'path';
import { AppModule } from './app.module';
import { AppService } from './app.service';

(async () => {
  // const { sslKey, sslCert, isHttps } =
  //   jsonfile.readFileSync(
  //     path.resolve(__dirname, 'configs', 'server.config.json'),
  //   ) || {};

  let httpsOptions;
  // if (isHttps) {
  //   const sslRoot = path.resolve(__dirname, 'ssl');
  //   httpsOptions = {
  //     key: fs.readFileSync(path.resolve(sslRoot, sslKey)),
  //     cert: fs.readFileSync(path.resolve(sslRoot, sslCert)),
  //   };
  // }

  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
    httpsOptions,
  });

  await app.get(AppService)?.init(app);
})();
