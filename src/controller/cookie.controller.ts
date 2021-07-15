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
  constructor(private cookieService: CookieService) {}

  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  async upload(
    @UploadedFiles() files: UploadFile[],
    @Body()
    body: {
      ip?: string;
      region?: string;
      mode?: number;
    },
  ): Promise<string> {
    console.log('uploadupload');

    return this.cookieService.upload({ files, ...body });
  }

  @Post('uploadstring')
  async uploadstring(
    @Body()
    body: {
      cookieJson: any[];
      cuser: string;
      ip?: string;
      region?: string;
      mode?: number;
    },
  ): Promise<string> {
    console.log('uploadstring');

    return this.cookieService.uploadstring(body);
  }

  @Get()
  async getCookie(
    @Query() req: { cuser: string },
  ): Promise<
    { new: number; trash?: number; mode?: number; cookie?: string } | string
  > {
    return this.cookieService.getCookie(req);
  }

  @Get('list')
  async fetchCookie(
    @Query() req: { startDate: Date; endDate: Date },
  ): Promise<{
    total: number;
    valid: number;
    invalid: number;
    newCookies: number;
    oldCookies: number;
    totalWithoutOld: number;
    list: { cookieId: string; cookie: string; createdTime: string }[];
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

  @Post('update')
  @UseInterceptors(AnyFilesInterceptor())
  async updateCookieStatus(
    @UploadedFiles() files: UploadFile[],
  ): Promise<string> {
    console.log('updateCookieStatus');

    return this.cookieService.updateCookieStatus({ files });
  }
}
