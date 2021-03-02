import { Injectable } from '@nestjs/common';
import * as jsonfile from 'jsonfile';
import * as path from 'path';
import { ConfigType } from 'src/models';

@Injectable()
export class ConfigService {
  /** Config 根目錄 */
  private get configRootPath() {
    return path.resolve(__dirname, '..', '..', 'configs');
  }

  private configs: { [key: string]: any } = {};

  get<T>(key: ConfigType): T {
    if (this.configs[key]) {
      return this.configs[key];
    }

    this.configs[key] = jsonfile.readFileSync(
      path.resolve(this.configRootPath, `${key}.config.json`),
    );

    return this.configs[key];
  }
}
