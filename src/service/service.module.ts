import { Global, HttpService, Module } from '@nestjs/common';
import { ConfigService } from 'src/core';
import { CommonService, DatabaseService, LoggerService } from 'src/service';
import { CookieService } from 'src/service/info/cookie.service';
import { ClientService } from './info/client.service';
import { TestService } from './info/test.service';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: LoggerService,
      inject: [ConfigService, HttpService],
      useFactory: (config: ConfigService, http: HttpService): LoggerService =>
        new LoggerService(http, config),
    },
    DatabaseService,
    CommonService,
    CookieService,
    ClientService,
    TestService,
  ],
  exports: [
    LoggerService,
    DatabaseService,
    CommonService,
    CookieService,
    ClientService,
    TestService
  ],
})
export class ServiceModule { }
