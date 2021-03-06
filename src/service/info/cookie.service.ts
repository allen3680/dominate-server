import { Injectable } from '@nestjs/common';
import { Cookie } from 'src/entity';
import { v4 as uuid } from 'uuid';
import { LogStatus, UploadFile } from 'src/models';
import { mergeMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';
import { DatabaseService } from 'src/service/database.service';
import { CommonService } from 'src/service/common.service';
import * as path from 'path';
import { Between, LessThan, MoreThan } from 'typeorm';
import { cookieStatus } from 'src/models/cookie';
import { LoggerService } from '../logger.service';

@Injectable()
export class CookieService {
  constructor(
    private databaseService: DatabaseService,
    private commonService: CommonService,
    private loggerService: LoggerService,
  ) { }

  /** 上傳Cookie */
  async upload(args: {
    files: UploadFile[];
    rqUuid?: string;
    rqVersion?: string;
    mode?: number;
  }): Promise<string> {
    const { files, rqUuid, rqVersion, mode } = args;

    const logId = this.loggerService.logStart(LogStatus.Info, '上傳Cookie', {
      rqUuid,
      rqVersion,
    });

    if (!Array.isArray(files) || files.length < 1) {
      this.loggerService.setLog(LogStatus.Error, '上傳Cookie失敗: 沒有檔案');
      return 'fail';
    }

    // 取得Cookie
    const cookie = await this.databaseService.getData({
      type: Cookie,
      filter: query => {
        query.where({ cookieId: rqUuid });

        return query;
      },
    });

    let cookieId: string;

    if (cookie) {
      console.log('cookie:', cookie);
      cookieId = cookie.cookieId;
    } else {
      cookieId = uuid();
    }

    // 產生檔名
    const fileName = cookieId.replace(/\-/g, '');

    // #region 解壓縮並儲存
    const { filePath } =
      (await this.commonService.saveFile({
        file: files[0],
        folderName: 'cookie',
        fileName,
      })) || {};

    const folderPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'uploads',
      'cookie',
      fileName,
    );

    // 解壓縮
    const fileCount = await this.commonService.unzip(filePath, folderPath);

    // 若檔案數量不為2, Cookie 跟 local_state.txt
    if (fileCount != 2) {
      this.loggerService.setLog(
        LogStatus.Error,
        '上傳Cookie失敗: 檔案數量有誤',
        { Input: fileCount },
      );

      return;
    }
    // #endregion

    // 新增一筆Cookie
    const newCookie = new Cookie({
      cookieId,
      folderName: fileName,
      version: rqVersion,
      isUsed: false,
      status: cookieStatus.BrandNew,
      mode,
    });

    await Cookie.save(newCookie);

    this.loggerService.logEnd(logId, { cookieId });

    return cookieId;
  }

  /** 取得單一Cookie */
  async getCookie(args: {
    cookieId?: string;
  }): Promise<{ cookieId: string; cookie: string; updatedTime: Date } | string> {
    const { cookieId } = args;

    const cookie = await this.databaseService.getData({
      type: Cookie,
      filter: query => {
        if (cookieId) {
          query.where({ cookieId });
        }

        return query.orderBy('Cookie.updatedTime', 'DESC');
      },
    });

    console.log('cookie:', cookie);

    if (!cookie) {
      return 'not found';
    }

    const { folderName, updatedTime, cookieId: dbCookieId } = cookie;

    let res: string;
    try {
      res = await this.commonService.decodeCookie('.facebook.com', folderName);
    } catch (error) {
      console.log('error:', error);
    }

    return { cookieId: dbCookieId, cookie: res, updatedTime };
  }

  /** 取得多個Cookie */
  async fetchCookies(args: {
    startDate: Date;
    endDate: Date;
  }): Promise<{ cookieId: string; cookie: string; updatedTime: Date }[] | string> {
    const { startDate, endDate } = args;

    const cookies = await this.databaseService.fetchData({
      type: Cookie,
      filter: query => {
        if (startDate && endDate) {
          query.where({ updatedTime: Between(startDate, endDate) });
        }

        if (startDate && !endDate) {
          query.where({ updatedTime: MoreThan(startDate) });
        }

        if (!startDate && endDate) {
          query.where({ updatedTime: LessThan(endDate) });
        }

        return query.orderBy('Cookie.updatedTime', 'DESC');
      },
    });

    console.log('cookies:', cookies);

    if (!Array.isArray(cookies) || cookies.length < 1) {
      return 'not found';
    }

    return from(cookies)
      .pipe(
        mergeMap(async cookie => {
          const { folderName, cookieId, updatedTime } = cookie;

          let res: any;
          try {
            res = await this.commonService.decodeCookie(
              '.facebook.com',
              folderName,
            );
          } catch (error) {
            console.log('error:', error);
          }
          return { cookieId, cookie: res, updatedTime };
        }),
        toArray(),
      )
      .toPromise();
  }
}
