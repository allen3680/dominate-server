export type ApiConfig = {
  protocol?: string;
  host?: string;
  port?: number;
  path?: string;
};

/** Python 設定 */
export type PythonConfig = {
  readCookie: string;
};

/** Redis 設定 */
export type RedisConfig = {
  host: string;
  port: number;
  password?: string;
  taskExpireTime?: number;
  userExpireTime?: number;
  otherExpireTime?: number;
};

/** Server 設定 */
export type ServerConfig = {
  port: number;
  globalPrefix: string;
  host: string;
  protocol: string;
};
/** logger 設定 */
export type LoggerConfig = {
  protocol: string;
  host: string;
  port: string;
  prefix: string;
  logTemplate: string;
};
