import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AdvancedEntity } from './AdvancedEntity';

@Entity()
export class Cookie extends AdvancedEntity<Cookie> {
  @PrimaryColumn({ length: 36 })
  cookieId: string;

  @Column({ length: 256, nullable: true })
  cuser: string;

  @Column({ length: 10000, nullable: true })
  cookieJson: string;

  @Column({ length: 256, nullable: true })
  folderName: string;

  @Column({ length: 256, nullable: true })
  ip: string;

  @Column({ length: 256, nullable: true })
  version: string;

  @Column({ default: 0 })
  mode: number;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ default: 0 })
  status: number;

  @Column({ length: 256, nullable: true })
  region: string;
}
