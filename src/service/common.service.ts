import { Injectable } from '@nestjs/common';
import * as csv from 'csvtojson';
import { ConfigService } from 'src/core';
import { ConfigType, PythonConfig, UploadFile } from 'src/models';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as fs from 'fs';
import * as extract from 'extract-zip';
import { HttpService } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import * as xlsx from "xlsx";

@Injectable()
export class CommonService {
  private get pythonConfig(): PythonConfig {
    return this.configService.get<PythonConfig>(ConfigType.Python);
  }

  private get pythonServerUrl(): string {
    const { protocol, host, port, prefix } = this.pythonConfig;
    return `${protocol}://${host}:${port}${prefix}/get_decrypt_cookie`;
  }

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) { }

  /** 儲存檔案 */
  async saveFile(args: {
    file: UploadFile;
    folderName: string;
    fileName?: string;
  }): Promise<{
    fieldname: string;
    fileName: string;
    filePath: string;
  }> {
    const { file, folderName } = args;
    const { fileName } = args;
    //#region 儲存檔案
    const { buffer, originalname, fieldname } = file;

    // 產生新的檔名
    const fileExtension = originalname.replace(/.*(\.\w+)$/, '$1');

    return new Promise(async (resolve, reject) => {
      const folderUploadPath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        folderName,
      );

      await mkdirp(folderUploadPath);

      const folderPath = path.resolve(
        __dirname, '..', '..', '..', 'uploads', folderName);

      await mkdirp(folderPath);

      let fileNameExt = `${fileName}${fileExtension}`;

      if (!fileName) {
        fileNameExt = originalname;
      }

      const filePath = path.resolve(folderPath, fileNameExt);

      fs.writeFile(filePath, buffer, err => {
        if (err) {
          console.log('error:', err);
          reject(err);
          return;
        }
        resolve({
          fieldname,
          fileName: fileNameExt,
          filePath,
        });
      });
    });
    //#endregion
  }

  /** 儲存CSV */
  async saveCsv(args: {
    data: string;
    folderName: string;
    fileName: string;
  }): Promise<{
    fileName: string;
    filePath: string;
  }> {
    const { data, folderName } = args;
    const { fileName } = args;

    return new Promise(async (resolve, reject) => {
      const folderUploadPath = path.resolve(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        folderName,
      );

      await mkdirp(folderUploadPath);

      const folderPath = path.resolve(
        __dirname, '..', '..', '..', 'uploads', folderName);

      await mkdirp(folderPath);

      const fileNameExt = `${fileName}.csv`;

      const filePath = path.resolve(folderPath, fileNameExt);

      fs.writeFile(filePath, data, err => {
        if (err) {
          console.log('error:', err);
          reject(err);
          return;
        }
        resolve({
          fileName: fileNameExt,
          filePath,
        });
      });
    });
  }

  /** 解壓縮 */
  async unzip(zipPath: string, folderPath: string): Promise<number> {
    console.log('開始解壓縮');
    await mkdirp(folderPath);

    await extract(zipPath, { dir: folderPath });

    fs.unlinkSync(zipPath);

    return fs.readdirSync(folderPath).length;
  }

  /** 解密Cookie */
  async decodeCookie(host: string, folderName: string): Promise<{ cuser: string, cookieJson: string }> {
    try {
      const url = `${this.pythonServerUrl}/?domain=${host}&cookie_id=${folderName}`;
      const response: AxiosResponse<{ c_user: string, output: string }> = await this.httpService
        .get(url)
        .toPromise();

      if (!response?.data?.c_user) {
        return { cuser: undefined, cookieJson: undefined };
      }

      return { cuser: response?.data?.c_user, cookieJson: response?.data?.output };
    } catch (error) {
      console.log('解析失敗:', error);
      return { cuser: undefined, cookieJson: undefined };
    }
  }

  csvToJson<T>(buffer: Buffer): Promise<T[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const csvData: T[] = await csv().fromString(buffer.toString());
        resolve(csvData);
      } catch (error) {
        reject(error);
      }
    });
  }

  convertToCsv<T>(titles: string[], datas: T[]): string {
    let csv = '';
    let row = '';
    titles.forEach(title => {
      if (title === null || title === undefined) {
        return;
      }
      row += `${title},`;
    });

    row = row.slice(0, -1);
    csv += `${row}\r\n`;

    datas.forEach(data => {
      row = '';
      titles.forEach(title => {
        if (title === null || title === undefined) {
          return;
        }

        row += `"${data[title]}"\t,`;
      });
      row.slice(0, row.length - 1);
      csv += `${row}\r\n`;
    });

    return csv;
  }

  padLeft(str: string, length: number): string {
    if (str.length >= length) {
      return str;
    }
    return this.padLeft(`0${str}`, length);
  }

  async convertToXlsx<T>(datas: T[], filePath: string): Promise<any> {
    const sheet = xlsx.utils.json_to_sheet(datas);

    const workBook = {
      SheetNames: ['sheet'],
      Sheets: {
        'sheet': sheet,
      }
    };

    return xlsx.writeFile(workBook, filePath);
  }
}
