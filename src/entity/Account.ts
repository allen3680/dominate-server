import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AdvancedEntity } from './AdvancedEntity';

@Entity()
export class Account extends AdvancedEntity<Account> {
  @PrimaryColumn({ length: 36 })
  accountId: string;

  @Column({ length: 256 })
  email: string;

  @Column({ length: 256, nullable: true })
  pass: string;

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
