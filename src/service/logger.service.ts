import { HttpService, Injectable } from '@nestjs/common';
import * as moment from 'moment';
import { ConfigService } from 'src/core';
import { ConfigType, LoggerConfig } from 'src/models';
import { LogMeta, LogStatus } from 'src/models/logger';
import { setInterval } from 'timers';
import { v4 as uuid } from 'uuid';

@Injectable()
export class LoggerService {
  private get loggerConfig(): LoggerConfig {
    return this.configService.get<LoggerConfig>(ConfigType.Logger);
  }

  private get loggerServerUrl(): string {
    const { protocol, host, port, prefix } = this.loggerConfig;
    return `${protocol}://${host}:${port}${prefix}/log`;
  }

  private loggerStore: {
    [key: string]: { Level: LogStatus; Message: string; Timestamp: number };
  } = {};

  /** 逾時間隔，預設 10 分鐘 */
  private timeoutInterval = 10 * 60 * 1000;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    setInterval(() => this.clearTimeoutLogs(), this.timeoutInterval);
  }

  clearTimeoutLogs(): void {
    const now = Date.now();
    const logs = Object.entries(this.loggerStore).filter(
      ([, { Timestamp }]) => now - Timestamp > this.timeoutInterval,
    );

    logs.forEach(([logId]) => this.removeTargetLog(logId));

    this.sendLog(LogStatus.Info, '清理逾時未發送的 Log', {
      Output: `${logs.length}筆`,
    });
  }

  setLog(level: LogStatus, message: string, meta?: LogMeta): Promise<string> {
    const logId = uuid();
    const { ExecuteTime, Input, Output } = meta || {};
    return this.sendLog(level, message, {
      ExecuteTime,
      Input: { logId, logData: Input },
      Output: { logId, logData: Output },
      StartTime: moment().format(),
    });
  }

  logStart(Level: LogStatus, Message: string, Input?: unknown): string {
    const logId = uuid();
    const Timestamp = Date.now();
    const StartTime = moment(Timestamp).format();

    this.loggerStore[logId] = { Level, Message, Timestamp };
    this.sendLog(Level, Message, {
      Input: { logId, logData: Input },
      StartTime,
    });
    return logId;
  }

  logEnd(logId: string, Output?: unknown): Promise<string> {
    const log = this.loggerStore[logId];
    if (!log) {
      return;
    }

    const { Level, Message, Timestamp } = log;

    // 從 loggerStore 移除對應的 logId
    this.removeTargetLog(logId);

    return this.sendLog(Level, Message, {
      ExecuteTime: Date.now() - Timestamp,
      Output: { logId, logData: Output },
    });
  }

  /** 從 loggerStore 移除對應的 logId */
  removeTargetLog(logId: string): void {
    delete this.loggerStore[logId];
  }

  private async sendLog(
    Level: LogStatus,
    Message: string,
    Meta?: LogMeta,
  ): Promise<string> {
    // 取得執行的實體名稱
    const { name: InstanceName = 'Unknown' } = process.env;

    try {
      const response = await this.httpService
        .post(this.loggerServerUrl, { Level, ...Meta, Message, InstanceName })
        .toPromise();
      return response.data;
    } catch (error) {
      console.log('Log 寫入失敗:', error);
      return;
    }
  }
}
