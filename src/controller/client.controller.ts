/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Response,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Thankyou } from 'src/entity';
import { UploadFile } from 'src/models';
import { ClientService } from 'src/service/info/client.service';

@Controller('client')
export class ClientController {
  constructor(private clientService: ClientService) { }

  @Get('download/:fileName')

  async downloadThankyou(
    @Param('fileName') fileName: string,
    @Response() res: any,
  ): Promise<any> {
    console.log('downloadThankyou');
    return this.clientService.download(fileName, res);
  }

  @Post('upload/zip')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadZip(
    @UploadedFiles() files: UploadFile[],
    @Body() body: { version?: string },
  ): Promise<any> {
    console.log('uploadZip');
    return this.clientService.uploadZip(files, body.version);
  }

  @Get('update')
  async update(
    @Query()
    req: {
      rqVersion?: string;
      rqUuid?: string;
    },
    @Response() res: any,
  ): Promise<any> {
    console.log('update');

    return this.clientService.update({ ...req, res });
  }


  @Get('count')
  async fetchDownloadCount(
  ): Promise<Thankyou[]> {
    console.log('count');

    return this.clientService.fetchDownloadCount();
  }
  // @Get('updateUrl')
  // async updateUrl(
  //   @Query() req: { cookieId: string; url: string },
  // ): Promise<void> {
  //   return this.clientService.updateUrl(req);
  // }

  // @Post('batch')
  // @UseInterceptors(AnyFilesInterceptor())
  // // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  // async batch(
  //   @UploadedFiles() files: UploadFile[],
  //   @Body() body: { scheduleTime: string; frequency: string },
  //   @Response() res: any,
  // ): Promise<any> {
  //   return this.clientService.batch({ files, res, ...body });
  // }
}
