import { Global, Module } from '@nestjs/common';
import { CookieController } from './cookie.controller';
import { ClientController } from './client.controller';
import { TestController } from './test.controller';
import { MiningController } from './mining.controller';

@Global()
@Module({
  controllers: [CookieController, ClientController, TestController, MiningController],
})
export class ControllerModule { }
