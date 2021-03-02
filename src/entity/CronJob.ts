import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AdvancedEntity } from './AdvancedEntity';

@Entity()
export class CronJob extends AdvancedEntity<CronJob> {
  /** CronJobId
   *  UUID
   */
  @PrimaryColumn({
    length: 36,
  })
  cronJobId: string;

  /** cronJobType */
  @Column()
  cronJobType: string;

  /** scheduleTime */
  @Column({ length: 36 })
  scheduleTime: string;

  /** frequency
   *  once, daily, monthly, yearly
   */
  @Column({
    length: 36,
  })
  frequency: string;

  /** batchImportPointId */
  @Column({
    nullable: true,
  })
  data: string;

  /** 是否完成 */
  @Column()
  status: number;

  /** 是否刪除 */
  @Column()
  isDeleted: boolean;
}
