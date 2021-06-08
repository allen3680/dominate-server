import { Injectable } from '@nestjs/common';
import * as csv from 'csvtojson';
import { ConfigService } from 'src/core';
import { LoggerService } from './logger.service';
import { ConfigType, PythonConfig, UploadFile } from 'src/models';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';
import * as extract from 'extract-zip';

@Injectable()
export class CommonService {
  get pythonConfig(): PythonConfig {
    return this.configService.get<PythonConfig>(ConfigType.Python);
  }
  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
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

  /** 解壓縮 */
  async unzip(zipPath: string, folderPath: string): Promise<number> {
    console.log('開始解壓縮');
    await mkdirp(folderPath);

    await extract(zipPath, { dir: folderPath });

    fs.unlinkSync(zipPath);

    return fs.readdirSync(folderPath).length;
  }

  /** 解密Cookie */
  decodeCookie(host: string, folderName: string): Promise<string> {
    console.log('folderName:', folderName);
    const folderPath = path.resolve(
      __dirname,
      '..',
      '..',
      '..',
      'uploads',
      'cookie',
      folderName,
    );

    console.log('path:', folderPath);

    return new Promise((resolve, reject) => {
      const python = spawn('python3', [
        this.pythonConfig.readCookie,
        host,
        folderPath,
      ]);

      try {
        console.log('start running python');
        let dataString: string;
        python.stdout.on('data', data => {
          dataString = data.toString();
          // dataString = dataString.replace('\n', '');
          // dataString = dataString.replace('', '');
          resolve(dataString);
        });

        python.on('close', async code => {
          console.log(`child process close all stdio with code ${code}`);
          console.log(dataString);
          resolve(await JSON.tryParse(dataString));
        });
      } catch (error) {
        console.log('error:', error);
        reject(error);
      }
    });
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
}
