import { Injectable, Type } from '@nestjs/common';
import 'reflect-metadata';
import { ApiResult, StatusCode } from 'src/models/common';
import { IsolationLevel } from 'src/plugins';
import {
  BaseEntity,
  Connection,
  QueryRunner,
  SelectQueryBuilder,
  TransactionQueryRunner,
} from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(private connection: Connection) { }

  async createTransactionQueryRunner(
    isolationLevel = IsolationLevel.Serializable,
  ): Promise<TransactionQueryRunner> {
    return this.connection.createTransactionQueryRunner({
      isolationLevel,
    });
  }

  /** 組出api的回傳格式 */
  convertToApiResult<T>(args?: {
    code?: StatusCode;
    message?: string;
    timestamp?: number;
    data?: T;
  }): ApiResult<T> {
    this.TransformDateToString(args?.data);

    return {
      code: StatusCode.Success, //預設為成功
      message: 'success', //預設為成功
      timestamp: Date.now(),
      ...args,
      //若data為空回傳空陣列
      data: args?.data,
    };
  }

  private TransformDateToString<T>(data?: T) {
    if (data instanceof Array) {
      data.forEach(arr => {
        this.TransformDateToString(arr);
      });
    }

    if (data instanceof Object) {
      this.TransformJsonObject(data);
    }
  }

  private TransformJsonObject<T>(data?: T) {
    let i = 0;
    Object.values(data).forEach(dataValue => {
      if (dataValue instanceof Object) {
        this.TransformJsonObject(dataValue);
      }

      if (dataValue instanceof Array) {
        dataValue.forEach(element => {
          this.TransformDateToString(element);
        });
      }

      if (dataValue instanceof Date) {
        data[Object.keys(data)[i]] = dataValue.format() as string;
      }
      i++;
    });
  }

  /** 組出api的回傳格式
   *  有分頁功能
   */
  convertToApiResultWithPaging<T>(args?: {
    code?: StatusCode;
    message?: string;
    timestamp?: number;
    data?: T;
    pageNo: number;
    pageSize: number;
    totalRecords: number;
  }): ApiResult<T> {
    const emptyArray: any = [];
    const { data, totalRecords } = args;
    let { pageNo, pageSize } = args;

    if (!pageNo || pageNo < 1) {
      pageNo = 1;
    }

    if (!pageSize || pageSize < 1) {
      pageSize = 10;
    }

    this.TransformDateToString(args?.data);

    return {
      //預設為成功
      code: StatusCode.Success,
      //預設為成功
      message: 'success',
      timestamp: Date.now(),
      ...args,
      //若data為空回傳空陣列
      data: data || emptyArray,
      pageNo: +pageNo,
      pageSize: +pageSize,
      totalRecords,
    };
  }

  /** 組出失敗時api的回傳格式 */
  convertToFailedApiResult<T>(message: string): ApiResult<T> {
    return this.convertToApiResult<T>({
      code: StatusCode.ServerError, //固定為失敗
      message, //錯誤訊息
    });
  }

  /** 當使用getRawOne或getRawMany時須自行定義欄位回傳名稱，初始統一使用欄位名作為別名 */
  generateAlias(columns: string[]): string[] {
    if (!Array.isArray(columns) || columns.length < 1) {
      return columns;
    }

    return columns.map(column => {
      if (column.indexOf(' as ') === -1) {
        column += ` as ${column.split('.')[1]}`;
      }
      return column;
    });
  }

  async query(query: string, parameters?: any[], queryRunner?: QueryRunner): Promise<any> {
    return this.connection.query(query, parameters, queryRunner);
  }

  /** 建立SelectQueryBuilder，並組好條件再回傳SelectQueryBuilder */
  createSelectQueryBuilder<T extends BaseEntity>(args: {
    //目標實體
    type: new (...options: any) => T;
    //實體別名
    alias?: string;
    //搜尋條件
    filter?: (query: SelectQueryBuilder<T>) => void;
    //欲撈出欄位
    columns?: string[];
  }): SelectQueryBuilder<T> {
    const { type, filter, columns } = args;
    const query = this.connection.getRepository(type).createQueryBuilder();
    if (filter) {
      filter(query);
    }
    return query.select(columns);
  }

  /** 使用多張資料表撈取多筆資料 */
  fetchDataWithJoin<T>(args: {
    type: new (...options: any) => BaseEntity;
    //實體別名
    alias?: string;
    filter?: (query: SelectQueryBuilder<BaseEntity>) => void;
    columns?: string[];
  }): Promise<T[]> {
    const { columns } = args;
    return this.createSelectQueryBuilder({
      ...args,
      columns: this.generateAlias(columns),
    }).getRawMany<T>();
  }

  /** 使用單張資料表撈取多筆資料 */
  fetchData<T extends BaseEntity>(args: {
    type: Type<T>;
    //實體別名
    alias?: string;
    filter?: (query: SelectQueryBuilder<T>) => void;
    columns?: string[];
  }): Promise<T[]> {
    return this.createSelectQueryBuilder(args).getMany();
  }

  /** 使用多張資料表撈取單筆資料 */
  getDataWithJoin<T>(args: {
    type: new (...options: any) => BaseEntity;
    //實體別名
    alias?: string;
    filter?: (query: SelectQueryBuilder<BaseEntity>) => void;
    columns?: string[];
  }): Promise<T> {
    const { columns } = args;
    return this.createSelectQueryBuilder({
      ...args,
      columns: this.generateAlias(columns),
    }).getRawOne();
  }

  /** 使用單張資料表撈取單筆資料 */
  getData<T extends BaseEntity>(args: {
    type: new (...options: any) => T;
    /** 實體別名 */
    alias?: string;
    filter?: (query: SelectQueryBuilder<T>) => void;
    columns?: string[];
  }): Promise<T> {
    return this.createSelectQueryBuilder(args).getOne();
  }

  /** 使用多張資料表撈取多筆資料，並設定頁數以及筆數 */
  fetchPagingWithJoin<T>(args: {
    type: new (...options: any) => BaseEntity;
    //當前頁數
    currentPage: number;
    //欲撈取筆數
    itemVisibleSize: number;
    columns?: string[];
    //實體別名
    alias?: string;
    filter?: (query: SelectQueryBuilder<BaseEntity>) => void;
  }): Promise<T[]> {
    const { filter, columns } = args;
    let { currentPage, itemVisibleSize } = args;

    // 防呆
    currentPage = +currentPage;
    itemVisibleSize = +itemVisibleSize;

    if (!currentPage || currentPage < 1) {
      currentPage = 1;
    }

    if (!itemVisibleSize || itemVisibleSize < 1) {
      itemVisibleSize = 10;
    }

    return this.createSelectQueryBuilder({
      ...args,
      filter: query => {
        query
          .offset((currentPage - 1) * itemVisibleSize)
          .limit(itemVisibleSize);
        if (!filter) {
          return;
        }
        filter(query);
      },
      columns: this.generateAlias(columns),
    }).getRawMany();
  }

  /** 使用單張資料表撈取多筆資料，並設定頁數以及筆數 */
  fetchPaging<T extends BaseEntity>(args: {
    type: new (...options: any) => T;
    //當前頁數
    currentPage: number;
    //欲撈取筆數
    itemVisibleSize: number;
    columns?: string[];
    //實體別名
    alias?: string;
    filter?: (query: SelectQueryBuilder<T>) => void;
  }): Promise<T[]> {
    const { filter } = args;
    let { currentPage, itemVisibleSize } = args;

    if (!currentPage || currentPage < 1) {
      currentPage = 1;
    }

    if (!itemVisibleSize || itemVisibleSize < 1) {
      itemVisibleSize = 10;
    }

    return this.createSelectQueryBuilder({
      ...args,
      filter: query => {
        if (filter) {
          filter(query);
        }
        query
          .offset((currentPage - 1) * itemVisibleSize)
          .limit(itemVisibleSize);
      },
    }).getMany();
  }

  /** 使用單張資料表撈取多筆資料，並設定頁數以及筆數 回傳總筆數 */
  fetchCount<T extends BaseEntity>(args: {
    type: new (...options: any) => T;
    filter?: (query: SelectQueryBuilder<T>) => void;
  }): Promise<number> {
    return this.createSelectQueryBuilder({
      ...args,
    }).getCount();
  }

  /** 使用單張資料表撈取多筆資料，並設定頁數以及筆數 回傳總筆數 & 資料 */
  async fetchPagingAndCount<T extends BaseEntity>(args: {
    type: new (...options: any) => T;
    //當前頁數
    currentPage: number;
    //欲撈取筆數
    itemVisibleSize: number;
    columns?: string[];
    //實體別名
    alias?: string;
    filter?: (query: SelectQueryBuilder<T>) => void;
  }): Promise<{ data: T[]; count: number }> {
    const count = await this.fetchCount(args);
    const data = await this.fetchPaging(args);
    return { data, count };
  }

  /** 使用多張資料表撈取多筆資料，並設定頁數以及筆數 回傳總筆數 & 資料 */
  async fetchPagingWithJoinAndCount<T>(args: {
    type: new (...options: any) => BaseEntity;
    //當前頁數
    currentPage: number;
    //欲撈取筆數
    itemVisibleSize: number;
    columns?: string[];
    //實體別名
    alias?: string;
    filter?: (query: SelectQueryBuilder<BaseEntity>) => void;
  }): Promise<{ data: T[]; count: number }> {
    const count = await this.fetchCount(args);
    const data = await this.fetchPagingWithJoin<T>(args);
    return { data, count };
  }

  isExist<T extends BaseEntity>(args: {
    //目標實體
    type: new (...options: any) => T;
    //實體別名
    alias?: string;
    //搜尋條件
    filter?: (query: SelectQueryBuilder<T>) => void;
    //欲撈出欄位
    columns?: string[];
  }): Promise<boolean> {
    return this.getData<T>(args).then(data => !!data);
  }
}
