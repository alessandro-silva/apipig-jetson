import Marking from '@modules/markings/infra/typeorm/entities/Marking';
import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('scores')
class Score {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column()
  weight: string;

  @Column()
  type: string;

  @Column()
  nfe: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column()
  status: boolean;

  @OneToMany(() => Marking, marking => marking.score, {
    eager: true,
  })
  @JoinTable()
  markings: Marking[];

  @Column()
  producer_id: string;

  @Column()
  file: string;

  @Expose({ name: 'file_url' })
  file_url(): string {
    switch (process.env.STORAGE_DRIVER) {
      case 'disk':
        return `${process.env.APP_API_URL}/scores/file/${this.file}`;
      case 's3':
        return `${process.env.AWS_BUCKET_URL}/scores/file/${this.file}`;
      default:
        return '';
    }
  }

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Score;
