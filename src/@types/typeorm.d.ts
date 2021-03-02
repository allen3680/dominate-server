import { QueryBuilderOptions, QueryPagingData } from 'src/plugins';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import {
  ReplicationMode,
  SaveOptions,
  SelectQueryBuilder,
  QueryRunner,
} from 'typeorm';

declare module 'typeorm' {
  interface Connection {
    createTransactionQueryRunner(args: {
      mode?: ReplicationMode;
      isolationLevel?: IsolationLevel;
    }): Promise<TransactionQueryRunner>;
  }
  export interface TransactionQueryRunner extends QueryRunner {
    queryBuilder<T>(args: QueryBuilderOptions<T>): SelectQueryBuilder<T>;
    getData<T>(args: QueryBuilderOptions<T>): Promise<T>;
    fetchData<T>(args: QueryBuilderOptions<T>): Promise<T[]>;
    fetchPaging<T>(args: QueryBuilderOptions<T>): Promise<T[]>;
    fetchCount<T>(args: QueryBuilderOptions<T>): Promise<number>;
    fetchPagingAndCount<T>(
      args: QueryBuilderOptions<T>,
    ): Promise<QueryPagingData<T>>;
    getDataWithJoin<T>(args: QueryBuilderOptions<T>): Promise<T>;
    fetchDataWithJoin<T>(args: QueryBuilderOptions<T>): Promise<T[]>;
    fetchPagingWithJoin<T>(args: QueryBuilderOptions<T>): Promise<T[]>;
    fetchPagingWithJoinAndCount<T>(
      args: QueryBuilderOptions<T>,
    ): Promise<QueryPagingData<T>>;
    save<T>(entities: T[], options?: SaveOptions): Promise<T[]>;
    save<T>(T: T, options?: SaveOptions): Promise<T>;
    endTransaction(): Promise<void>;
  }
}
