import { Global, HttpService, Module } from '@nestjs/common';
import { ConfigService } from 'src/core';
import { CommonService, DatabaseService, LoggerService } from 'src/service';
import { CookieService } from 'src/service/info/cookie.service';
import { ClientService } from './info/client.service';
import { MiningService } from './info/mining.service';
import { TestService } from './info/test.service';
import { AccountService } from './info/account.service';

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
    MiningService,
    TestService,
    AccountService,
  ],
  exports: [
    LoggerService,
    DatabaseService,
    CommonService,
    CookieService,
    ClientService,
    MiningService,
    TestService,
    AccountService
  ],
})
export class ServiceModule { }
