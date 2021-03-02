/** 此處 ConfigType 的值，
 * 需對應 configs 資料夾內的 json 檔案名稱，
 * config 檔案命名規則：{file name}.config.json，
 * 如：server.config.json 則 ConfigType 應增加 server */
export enum ConfigType {
  Database = 'database',
  Server = 'server',
  Logger = 'logger',
  Redis = 'redis',
  Python = 'python',
}

export type ApiResult<T> = {
  code?: StatusCode;
  message?: string;
  timestamp?: number;
  data?: T;
  pageNo?: number;
  pageSize?: number;
  totalRecords?: number;
};

/** 定義api結果狀態 */
export enum StatusCode {
  /** 處理成功 */
  Success = '0000',
  /** 請求參數錯誤 */
  RequestParamError = '0101',
  /** 驗證碼錯誤 */
  HashVerifyError = '0102',
  /** 交易行為代碼格式檢核錯誤 */
  ActionCodeFormatError = '0201',
  /** 交易行為代碼重覆 */
  ActionCodeDuplicate = '0202',
  /** 任務部分成功 */
  PartialTaskError = '0302',
  /** 玉山員工編號已存在 */
  UserNoDuplicate = '0501',
  /** 客戶端使用者不存在 */
  ClientNotExists = '0601',
  /** 商品不可編輯 */
  ProductCannotModify = '0701',
  /** 查無商品 */
  ProductCannotFind = '0702',
  /** 系統錯誤 */
  ServerError = '9999',
  /** 點數轉贈失敗(找不到轉贈者資料) */
  PointTransferError = '0404',
  /** 點數兌換失敗(找不到商品) */
  PointExchangeError = '0403',
  /** 商品不足 */
  ProductInsufficient = '0405',
  /** 點數不足 */
  PointInsufficient = '0401',
  /** 觸發任務失敗(交易行為代碼或任務代碼找不到) */
  TaskTriggerError = '0301',
  /** 查不到觸發任務 */
  TriggerTaskNotFound = '0303',
}

export enum TaskRecordStatus {
  /** 處理中 */
  Pending = 0,
  /** 處理完成-失敗 */
  Failed = 1,
  /** 處理完成-成功 */
  Success = 2,
}

export enum Frequency {
  /** once */
  Once = 'once',

  /** daily */
  Daily = 'daily',

  /** monthly */
  Monthly = 'monthly',

  /** yearly */
  Yearly = 'yearly',
}
