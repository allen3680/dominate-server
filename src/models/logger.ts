export type LogMeta = {
  ExecuteTime?: number;
  Input?: unknown;
  Output?: unknown;
  StartTime?: string;
};

export enum LogStatus {
  Debug = 'Debug',
  Info = 'Info',
  Warn = 'Warn',
  Error = 'Error',
  Fatal = 'Fatal',
}
