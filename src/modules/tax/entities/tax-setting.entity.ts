import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tax_settings')
export class TaxSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 5, scale: 2, default: 2.0 })
  tax_rate: number;

  @Column({ default: true })
  is_active: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}