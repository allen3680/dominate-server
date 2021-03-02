import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AdvancedEntity } from './AdvancedEntity';

@Entity()
export class Thankyou extends AdvancedEntity<Thankyou> {
  @PrimaryColumn({ length: 36 })
  thankyouId: string;

  @Column({ length: 256 })
  fileName: string;

  @Column({ length: 256, nullable: true })
  version: string;

  @Column()
  count: number;

  @Column({ default: 0 })
  status: number;
}
