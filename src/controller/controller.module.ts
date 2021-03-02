import { Global, Module } from '@nestjs/common';
import { CookieController } from './cookie.controller';
import { ClientController } from './client.controller';

@Global()
@Module({
  controllers: [CookieController, ClientController],
})
export class ControllerModule {}
