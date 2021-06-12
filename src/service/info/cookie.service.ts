/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Injectable } from '@nestjs/common';
import { Cookie, CookieHistory } from 'src/entity';
import { v4 as uuid } from 'uuid';
import { LogStatus, UploadFile } from 'src/models';
import { DatabaseService } from 'src/service/database.service';
import { CommonService } from 'src/service/common.service';
import * as path from 'path';
import { Between, LessThan, MoreThan } from 'typeorm';
import { CookieStatus } from 'src/models/cookie';
import { LoggerService } from '../logger.service';
import mkdirp from 'mkdirp';

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

    let cookieId: string = uuid();

    // 若檔案無效
    if (!Array.isArray(files) || files.length < 1) {
      this.loggerService.setLog(LogStatus.Error, '上傳Cookie失敗: 沒有檔案');

      await this.saveCookieHistory({ firstTime: true });
      await this.saveCookie({ cookieId, mode, version: rqVersion });

      return 'fail';
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

    // 解析Cookie
    const { cuser, cookieJson } =
      await this.commonService.decodeCookie('.facebook.com', fileName);

    if (!cuser) {
      this.loggerService.setLog(LogStatus.Error, '上傳Cookie失敗: 無法解析');

      await this.saveCookieHistory({ firstTime: true });
      await this.saveCookie({ cookieId, mode, version: rqVersion });

      return 'fail';
    }

    // 檢查Cookie是否已存在
    const cookie = await this.databaseService.getData({
      type: Cookie,
      filter: query =>
        query.where({ cuser })
    });

    let firstTime = true;

    if (cookie) {
      console.log('Cookie已存在');


      cookieId = cookie.cookieId;
      firstTime = false;
    }

    await this.saveCookieHistory({ cuser, firstTime });

    // 新增一筆Cookie
    await this.saveCookie({
      cookieId, mode, version: rqVersion,
      cookieJson: JSON.tryStringify(cookieJson), cuser, fileName
    })

    this.loggerService.logEnd(logId, { cookieId });

    return cookieId;
  }

  /** 取得單一Cookie */
  async getCookie(args: {
    cookieId?: string;
    cuser?: string;
  }): Promise<{ cookieId: string; cookie: string; updatedTime: string } | string> {
    const { cookieId, cuser } = args;

    const cookie = await this.databaseService.getData({
      type: Cookie,
      filter: query => {
        if (cookieId) {
          query.where({ cookieId });
        }

        if (cuser) {
          query.where({ cuser });
        }

        return query.orderBy('Cookie.updatedTime', 'DESC');
      },
    });

    console.log('cookie:', cookie);

    if (!cookie) {
      return 'not found';
    }

    const { cookieJson, updatedTime, cookieId: dbCookieId } = cookie;

    return { cookieId: dbCookieId, cookie: JSON.tryParse(cookieJson), updatedTime: updatedTime.format('yyyy/MM/DD HH:mm:ss') };
  }

  /** 取得多個Cookie */
  async fetchCookies(args: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    total: number, valid: number, invalid: number, newCookies: number, oldCookies: number,
    list: { cookieId: string; cookie: string; updatedTime: string }[]
  }> {
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

        return query
          .andWhere('Cookie.status = :status', { status: CookieStatus.Valid })
          .orderBy('Cookie.createdTime', 'DESC');
      },
    });

    const cookieHistory = await this.databaseService.fetchData({
      type: CookieHistory,
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

        return query.orderBy('CookieHistory.createdTime', 'DESC');
      },
    });

    const total = cookieHistory.length;
    const invalid = cookieHistory.filter(({ cuser }) => !cuser).length;
    const valid = total - invalid;
    const oldCookies = cookieHistory.filter(({ firstTime }) => !firstTime).length;
    const newCookies = total - oldCookies - invalid;

    if (!Array.isArray(cookies) || cookies.length < 1) {
      return {
        total, valid, invalid,
        newCookies, oldCookies,
        list: []
      };
    }

    return {
      total, valid, invalid,
      newCookies, oldCookies,
      list: cookies.map(
        ({ cookieId, cookieJson, updatedTime }) =>
          ({ cookieId, cookie: JSON.tryParse(cookieJson), updatedTime: updatedTime.format('yyyy/MM/DD HH:mm:ss') })
      )
    };
  }

  /** 使用多個Cookie */
  async useCookies(args: {
    amount: number;
  }, res: any): Promise<any> {
    const { amount = 0 } = args;

    const cookies = await this.databaseService.fetchData({
      type: Cookie,
      filter: query => {
        query.where({ status: CookieStatus.Valid, isUsed: false });
        query.limit(amount);
        return query.orderBy('Cookie.updatedTime', 'ASC');
      },
    });

    if (!Array.isArray(cookies) || cookies.length < 1) {
      return 'not found';
    }

    cookies.map(cookie => {
      cookie.isUsed = true;
      cookie.updatedTime = new Date();
    })

    await Cookie.save(cookies);

    const list = cookies.map(
      ({ cookieJson, updatedTime, cookieId }, index) => {
        return {
          No: index + 1,
          Status: '',
          AdvancedStatus: '',
          Cookie: cookieJson,
          UpdatedTime: updatedTime.format('yyyy/MM/DD HH:mm:ss'),
          Id: cookieId
        }
      }
    );

    const folderPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'uploads',
      'cookieCsv'
    );

    await mkdirp(folderPath);

    const filePath = path.resolve(
      folderPath,
      `Cookie_${new Date().format('yyyyMMDD')}.xlsx`
    );

    await this.commonService
      .convertToXlsx<{ No: number, Status: string, AdvancedStatus: string, Cookie: string; UpdatedTime: string, Id: string }>(
        list, filePath
      )

    return res.download(filePath);
  }

  /** 寫入Cookie */
  async saveCookie(args: {
    version: string;
    mode: number;
    cookieId: string;
    cuser?: string;
    cookieJson?: string;
    fileName?: string;
  }): Promise<void> {
    const { version, mode, cookieId, cuser, cookieJson, fileName } = args;

    try {
      await new Cookie({
        cookieId,
        cuser,
        cookieJson,
        folderName: fileName,
        version,
        isUsed: false,
        status: cuser ? CookieStatus.Valid : CookieStatus.Invalid,
        mode,
        updatedTime: new Date()
      }).save();
    } catch (error) {
      console.log('寫入Cookie失敗: ', error);
    }

    return;
  }

  /** 寫入CookieHistory */
  async saveCookieHistory(
    args: { cuser?: string, firstTime?: boolean }
  ): Promise<any> {
    const { cuser, firstTime } = args;
    try {
      await new CookieHistory({
        cookieHistoryId: uuid(),
        cuser,
        firstTime,
      }).save();
      return;
    } catch (error) {
      console.log(' 寫入CookieHistory 失敗:', error);
      return;
    }
  }
}
