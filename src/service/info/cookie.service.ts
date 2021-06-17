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
    region?: string;
    ip?: string;
    rqUuid?: string;
    rqVersion?: string;
    mode?: number;
  }): Promise<string> {
    const { files, rqUuid, rqVersion, mode, region, ip } = args;

    const logId = this.loggerService.logStart(LogStatus.Info, '上傳Cookie', {
      rqUuid,
      rqVersion,
    });

    const cookieId: string = uuid();

    // 若檔案無效
    if (!Array.isArray(files) || files.length < 1) {
      this.loggerService.setLog(LogStatus.Error, '上傳Cookie失敗: 沒有檔案');
      console.log('上傳Cookie失敗: 沒有檔案');
      await this.saveCookieHistory({ firstTime: true });
      // await this.saveCookie({ cookieId, mode, version: rqVersion });

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

      console.log('上傳Cookie失敗: 檔案數量有誤');

      return 'fail';
    }
    // #endregion

    // 解析Cookie
    const { cuser, cookieJson } =
      await this.commonService.decodeCookie('.facebook.com', fileName);

    console.log('cuser:', cuser);

    if (!cuser) {
      this.loggerService.setLog(LogStatus.Error, '上傳Cookie失敗: 無法解析');
      console.log('上傳Cookie失敗: 無法解析');

      await this.saveCookieHistory({ firstTime: true });
      // await this.saveCookie({ cookieId, mode, version: rqVersion });

      return 'fail';
    }

    // 檢查Cookie是否已存在
    const cookieHistory = await this.databaseService.getData({
      type: CookieHistory,
      filter: query =>
        query.where({ cuser })
    });

    if (cookieHistory) {
      console.log('Cookie已存在');

      await this.saveCookieHistory({ cuser, firstTime: false });
      // 更新cookie
      await this.saveCookie({
        cookieId, mode, version: rqVersion,
        cookieJson: JSON.tryStringify(cookieJson), cuser, fileName
      });

      return cookieId;
    }

    await this.saveCookieHistory({ cuser, firstTime: true });

    // 新增一筆Cookie
    await this.saveCookie({
      cookieId, mode, version: rqVersion, status: CookieStatus.Valid, region, ip,
      cookieJson: JSON.tryStringify(cookieJson), cuser, fileName, isUsed: false
    });

    this.loggerService.logEnd(logId, { cookieId });
    console.log('上傳Cookie成功');

    return cookieId;
  }

  /** 取得單一Cookie */
  async getCookie(args: {
    cuser: string;
  }): Promise<{ new: number; trash?: number; cookie?: string; } | string> {
    const { cuser } = args;

    const cookie = await this.databaseService.getData({
      type: Cookie,
      filter: query => {

        query.where({ cuser });

        return query.orderBy('Cookie.createdTime', 'DESC');
      },
    });

    console.log('cookie:', cookie);

    if (!cookie) {
      return JSON.tryStringify({ new: 1, trash: null, cookie: [] });
    }

    const { cookieJson, status } = cookie;
    let trash = 0;

    if (status === 1) {
      trash = 1;
    }

    const res = { new: 0, trash, cookie: JSON.tryParse(cookieJson) };
    console.log(JSON.tryStringify(res));

    return JSON.tryStringify(res);
  }

  /** 取得多個Cookie */
  async fetchCookies(args: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    total: number, valid: number, invalid: number, newCookies: number, oldCookies: number, totalWithoutOld: number
    list: { cookieId: string; cookie: string; createdTime: string }[]
  }> {
    const { startDate, endDate } = args;

    const cookies = await this.databaseService.fetchData({
      type: Cookie,
      filter: query => {
        if (startDate && endDate) {
          query.where({ createdTime: Between(startDate, endDate) });
        }

        if (startDate && !endDate) {
          query.where({ createdTime: MoreThan(startDate) });
        }

        if (!startDate && endDate) {
          query.where({ createdTime: LessThan(endDate) });
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
          query.where({ createdTime: Between(startDate, endDate) });
        }

        if (startDate && !endDate) {
          query.where({ createdTime: MoreThan(startDate) });
        }

        if (!startDate && endDate) {
          query.where({ createdTime: LessThan(endDate) });
        }

        return query.orderBy('CookieHistory.createdTime', 'DESC');
      },
    });

    const total = cookieHistory.length;
    const invalid = cookieHistory.filter(({ cuser }) => !cuser).length;
    const valid = total - invalid;
    const oldCookies = cookieHistory.filter(({ firstTime }) => !firstTime).length;
    const newCookies = total - oldCookies - invalid;
    const totalWithoutOld = total - oldCookies;

    if (!Array.isArray(cookies) || cookies.length < 1) {
      return {
        total, valid, invalid,
        newCookies, oldCookies, totalWithoutOld,
        list: []
      };
    }

    return {
      total, valid, invalid,
      newCookies, oldCookies, totalWithoutOld,
      list: cookies.map(
        ({ cookieId, cookieJson, createdTime }) =>
          ({ cookieId, cookie: JSON.tryParse(cookieJson), createdTime: createdTime.format('yyyy/MM/DD HH:mm:ss') })
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
        return query.orderBy('Cookie.createdTime', 'ASC');
      },
    });

    if (!Array.isArray(cookies) || cookies.length < 1) {
      return res.send('not found');
    }

    cookies.map(cookie => {
      cookie.isUsed = true;
      cookie.updatedTime = new Date();
    })

    await Cookie.save(cookies);

    const list = cookies.map(
      ({ cookieJson, createdTime, cookieId }, index) => {
        return {
          No: index + 1,
          Status: '',
          AdvancedStatus: '',
          Cookie: cookieJson,
          CreatedTime: createdTime.format('yyyy/MM/DD HH:mm:ss'),
          Id: cookieId,
          Times: 0
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

    // await mkdirp(folderPath);

    const filePath = path.resolve(
      folderPath,
      `Cookie_${new Date().format('yyyyMMDD')}.xlsx`
    );

    await this.commonService
      .convertToXlsx
      <{ No: number, Status: string, AdvancedStatus: string, Cookie: string; CreatedTime: string, Id: string, Times: number }>(
        list, filePath
      )

    return res.download(filePath);
  }

  /** 寫入Cookie */
  async saveCookie(args: {
    ip?: string;
    region?: string;
    version: string;
    mode: number;
    cookieId: string;
    status?: CookieStatus;
    cuser?: string;
    cookieJson?: string;
    fileName?: string;
    isUsed?: boolean;
  }): Promise<void> {
    const { fileName } = args;

    try {
      await new Cookie({
        ...args,
        folderName: fileName,
        updatedTime: new Date(),
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
