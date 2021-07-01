import { Column, Entity, PrimaryColumn } from 'typeorm';
import { AdvancedEntity } from './AdvancedEntity';

@Entity()
export class Miner extends AdvancedEntity<Miner> {
  @PrimaryColumn({ length: 36 })
  minerId: string;

  @Column()
  joinDate: Date;
}
