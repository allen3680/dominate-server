/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  Response,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UploadFile } from 'src/models/client';
import { CookieService } from 'src/service/info/cookie.service';

@Controller('cookie')
export class CookieController {
  constructor(private cookieService: CookieService) { }

  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  async upload(
    @UploadedFiles() files: UploadFile[],
    @Body()
    body: {
      rqUuid?: string;
      rqVersion?: string;
      mode?: number;
    },
  ): Promise<string> {
    console.log('uploadupload');

    return this.cookieService.upload({ files, ...body });
  }

  @Get()
  async getCookie(
    @Query() req: { cookieId?: string, cuser?: string },
  ): Promise<{ cookieId: string; cookie: string; updatedTime: string } | string> {
    return this.cookieService.getCookie(req);
  }

  @Get('list')
  async fetchCookie(
    @Query() req: { startDate: Date; endDate: Date },
  ): Promise<{
    total: number, valid: number, invalid: number, newCookies: number, oldCookies: number,
    list: { cookieId: string; cookie: string; updatedTime: string }[]
  }> {
    console.log('fetchCookie');

    return this.cookieService.fetchCookies(req);
  }

  @Get('use')
  async useCookie(
    @Query() req: { amount: number },
    @Response() res: any,
  ): Promise<any> {
    console.log('useCookie');

    return this.cookieService.useCookies(req, res);
  }
}
