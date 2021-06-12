import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AdvancedEntity } from './AdvancedEntity';

@Entity()
export class CookieHistory extends AdvancedEntity<CookieHistory> {
  @PrimaryColumn({ length: 36 })
  cookieHistoryId: string;

  @Column({ length: 256, nullable: true })
  cuser: string;

  @Column({ default: true })
  firstTime: boolean;
}
