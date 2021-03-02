import { Type } from '@nestjs/common';
import {
  Connection,
  ReplicationMode,
  SaveOptions,
  SelectQueryBuilder,
  TransactionQueryRunner,
} from 'typeorm';

Connection.prototype.createTransactionQueryRunner = async function(args: {
  mode?: ReplicationMode;
  isolationLevel?: IsolationLevel;
}) {
  const { mode, isolationLevel } = args;
  const runner = this.createQueryRunner(mode) as TransactionQueryRunner;

  const generateAlias = (columns: string[]) => {
    if (!Array.isArray(columns) || columns.length < 1) {
      return columns;
    }

    return columns.map(column => {
      if (column.includes(' as ')) {
        return column;
      }
      return `${column} as ${column.replace(/^[^\.]+\.([^\.]+)$/g, '$1')}`;
    });
  };

  //#region 實作 QueryRunner Plugin Method
  // 實作 QueryRunner queryBuilder
  runner.queryBuilder = ({
    type,
    filter,
    alias,
    columns,
    lockMode,
    currentPage,
    itemVisibleSize,
  }) => {
    const query = runner.manager
      .getRepository(type)
      .createQueryBuilder(alias)
      .select(columns);

    if (lockMode) {
      query.setLock(lockMode);
    }

    if (filter) {
      filter(query);
    }

    if (currentPage > 0 && itemVisibleSize > 0) {
      query.offset((currentPage - 1) * itemVisibleSize).limit(itemVisibleSize);
    }

    return query;
  };

  // 實作 QueryRunner fetchData
  runner.fetchData = options => runner.queryBuilder(options).getMany();

  // 實作 QueryRunner getData
  runner.getData = options => runner.queryBuilder(options).getOne();

  // 實作 QueryRunner fetchPaging
  runner.fetchPaging = ({
    filter,
    currentPage,
    itemVisibleSize,
    ...options
  }) => {
    if (!currentPage || currentPage < 1) {
      currentPage = 1;
    }

    if (!itemVisibleSize || itemVisibleSize < 1) {
      itemVisibleSize = 10;
    }

    return runner
      .queryBuilder({
        ...options,
        filter: query => {
          if (filter) {
            filter(query);
          }
          query
            .offset((currentPage - 1) * itemVisibleSize)
            .limit(itemVisibleSize);
        },
      })
      .getMany();
  };

  // 實作 QueryRunner fetchCount
  runner.fetchCount = options => runner.queryBuilder(options).getCount();

  // 實作 QueryRunner fetchPagingAndCount
  runner.fetchPagingAndCount = async options => ({
    data: await runner.fetchPaging(options),
    count: await runner.fetchCount(options),
  });

  // 實作 QueryRunner getDataWithJoin
  runner.getDataWithJoin = ({ columns, ...options }) =>
    runner
      .queryBuilder({ ...options, columns: generateAlias(columns) })
      .getRawOne();

  // 實作 QueryRunner fetchDataWithJoin
  runner.fetchDataWithJoin = ({ columns, ...options }) =>
    runner
      .queryBuilder({ ...options, columns: generateAlias(columns) })
      .getRawMany();

  // 實作 QueryRunner fetchPagingWithJoin
  runner.fetchPagingWithJoin = ({
    filter,
    columns,
    currentPage,
    itemVisibleSize,
    ...options
  }) => {
    if (!currentPage || currentPage < 1) {
      currentPage = 1;
    }

    if (!itemVisibleSize || itemVisibleSize < 1) {
      itemVisibleSize = 10;
    }

    return runner
      .queryBuilder({
        ...options,
        filter: query => {
          if (filter) {
            filter(query);
          }
          query
            .offset((currentPage - 1) * itemVisibleSize)
            .limit(itemVisibleSize);
        },
        columns: this.generateAlias(columns),
      })
      .getRawMany();
  };

  // 實作 QueryRunner fetchPagingWithJoinAndCount
  runner.fetchPagingWithJoinAndCount = async options => ({
    data: await runner.fetchDataWithJoin(options),
    count: await runner.fetchCount(options),
  });

  // 實作 QueryRunner save
  runner.save = async <T>(entity: T | T[], options?: SaveOptions) =>
    runner.manager
      .save(entity, options)
      .catch(async error => {
        console.error('QueryRunner.save Error:', error);
        await runner.rollbackTransaction();
        await runner.release();
      });

  // 實作 QueryRunner endTransaction
  runner.endTransaction = () =>
    runner
      .commitTransaction()
      .catch(error => {
        console.error('QueryRunner.commitTransaction Error:', error);
        return runner.rollbackTransaction();
      })
      .finally(() => runner.release());
  //#endregion

  await runner.connect();
  await runner.startTransaction(isolationLevel);
  return runner;
};

export type QueryBuilderOptions<T> = {
  type: Type<T>;
  filter: (query: SelectQueryBuilder<T>) => void;
  alias?: string;
  columns?: string[];
  lockMode?: LockMode;
  /** 當前頁數 */
  currentPage?: number;
  /** 欲撈取筆數 */
  itemVisibleSize?: number;
};

export enum LockMode {
  PessimisticRead = 'pessimistic_read',
  PessimisticWrite = 'pessimistic_write',
  DirtyRead = 'dirty_read',
  PessimisticPartialWrite = 'pessimistic_partial_write',
  PessimisticWriteOrFail = 'pessimistic_write_or_fail',
  ForNoKeyUpdate = 'for_no_key_update',
}

export enum IsolationLevel {
  ReadUncommitted = 'READ UNCOMMITTED',
  ReadCommitted = 'READ COMMITTED',
  RepeatableRead = 'REPEATABLE READ',
  Serializable = 'SERIALIZABLE',
}

export type QueryPagingData<T> = {
  data: T[];
  count: number;
};
