import { BaseEntity, Column } from 'typeorm';

export class AdvancedEntity<T> extends BaseEntity {
  /**
   *  更新時間
   */
  @Column()
  updatedTime: Date;

  /**
   *  新增時間
   */
  @Column()
  createdTime: Date;

  constructor(value?: Partial<T>) {
    super();
    // const now = new Date();
    // this.createdTime = now;
    // this.updatedTime = now;
    this.set(value);
  }

  set(value: Partial<T>): this {
    Object.assign(this, value);
    return this;
  }
}
