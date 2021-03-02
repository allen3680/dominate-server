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
import { UploadFile } from 'src/models';
import { ClientService } from 'src/service/info/client.service';

@Controller('client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Get('download/:fileName')
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async downloadThankyou(
    @Param('fileName') fileName: string,
    @Response() res: any,
  ): Promise<any> {
    return this.clientService.download(fileName, res);
  }

  @Post('upload/zip')
  @UseInterceptors(AnyFilesInterceptor())
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async uploadZip(@UploadedFiles() files: UploadFile[]): Promise<any> {
    return this.clientService.uploadZip(files);
  }

  @Get('update')
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async update(
    @Query()
    req: {
      rqVersion?: string;
      rqUuid?: string;
    },
    @Response() res: any,
  ): Promise<any> {
    return this.clientService.update({ ...req, res });
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
