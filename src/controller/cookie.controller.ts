import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
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
    @Query() req: { cookieId?: string },
  ): Promise<{ cookieId: string; cookie: string; updatedTime: Date } | string> {
    return this.cookieService.getCookie(req);
  }

  @Get('list')
  async fetchCookie(
    @Query() req: { startDate: Date; endDate: Date },
  ): Promise<{ cookieId: string; cookie: string; updatedTime: Date }[] | string> {
    console.log('fetchCookie');

    return this.cookieService.fetchCookies(req);
  }
}
