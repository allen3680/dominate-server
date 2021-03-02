import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { from } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';
import { Cookie } from 'src/entity';
import { LogStatus, UploadFile } from 'src/models';
import { cookieStatus } from 'src/models/cookie';
import { CommonService } from '../common.service';
import { DatabaseService } from '../database.service';
import { LoggerService } from '../logger.service';
import { v4 as uuid } from 'uuid';
import { Thankyou } from 'src/entity/Thankyou';
import { query } from 'express';
import { IsolationLevel, LockMode } from 'src/plugins';

@Injectable()
export class ClientService {
  constructor(
    private databaseService: DatabaseService,
    private commonService: CommonService,
    private loggerService: LoggerService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async download(fileName: string, res: any): Promise<any> {
    const runner = await this.databaseService.createTransactionQueryRunner();

    const thankyou = await runner.getData({
      type: Thankyou,
      filter: query => query.where({ fileName }),
      lockMode: LockMode.PessimisticWrite,
    });

    const { count } = thankyou;

    thankyou.set({
      count: count + 1,
    });

    await runner.save(thankyou);

    await runner.endTransaction();

    const folderPath = path.resolve(__dirname, '..', '..', 'uploads');

    const filePath = path.join(folderPath, 'download', fileName);

    return res.sendFile(filePath);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async uploadZip(files: UploadFile[]): Promise<any> {
    if (!Array.isArray(files) || files.length < 1) {
      this.loggerService.setLog(LogStatus.Error, 'uploadZip失敗: 未上傳檔案');
      return false;
    }

    const isSuccess = await from(files)
      .pipe(
        mergeMap(async file => {
          try {
            await this.commonService.saveFile({ file, folderName: 'download' });
            return true;
          } catch (error) {
            this.loggerService.setLog(LogStatus.Error, 'uploadZip失敗', {
              Output: error,
            });
            return false;
          }
        }),
        toArray(),
      )
      .toPromise();

    if (isSuccess.some(item => !item)) {
      return false;
    }

    return true;
  }

  /** 更新thankyou */
  async update(args: {
    rqVersion?: string;
    rqUuid?: string;
    res: any;
  }): Promise<any> {
    const { rqVersion, rqUuid, res } = args;

    const thankyou = await this.databaseService.getData({
      type: Thankyou,
      filter: query =>
        query.where({ status: 0 }).orderBy('Thankyou.updatedTime', 'DESC'),
    });

    const { version, fileName } = thankyou || {};

    if (!version || rqVersion === version) {
      return;
    }

    const cookie = await this.databaseService.getData({
      type: Cookie,
      filter: query => query.where({ cookieId: rqUuid }),
    });

    if (cookie) {
      await cookie.set({ version }).save();
    }

    const folderPath = path.resolve(__dirname, '..', '..', 'uploads');

    const filePath = path.join(folderPath, 'thankyou', fileName);

    return res.sendFile(filePath);
  }

  // async batch(args: {
  //   files: UploadFile[];
  //   res: any;
  //   scheduleTime: string;
  //   frequency: string;
  // }): Promise<any> {
  //   const { files, scheduleTime, res, frequency } = args;

  //   if (!Array.isArray(files) || files.length < 1) {
  //     console.log('上傳檔案失敗');
  //     return false;
  //   }

  //   // #region 解壓縮並儲存
  //   const { filePath } =
  //     (await this.commonService.saveFile({
  //       file: files[0],
  //       folderName: 'cookie',
  //     })) || {};

  //   return res.sendFile(files[0]);
  // }

  // async updateUrl(args: { cookieId: string; url: string }): Promise<void> {
  //   const { cookieId, url } = args;

  //   console.log('updateUrl cookieId:', cookieId, 'url:', url);

  //   const cookie = await this.databaseService.getData({
  //     type: Cookie,
  //     filter: query => query.where({ cookieId }),
  //   });

  //   await cookie
  //     .set({
  //       url,
  //       status: cookieStatus.Alive,
  //     })
  //     .save();

  //   return;
  // }
}
