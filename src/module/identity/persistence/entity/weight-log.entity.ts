import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne, type Relation } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'weight_logs' })
export class WeightLog extends DefaultEntity<WeightLog> {
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? Number(value) : value),
    },
  })
  weight: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  measuredAt: Date;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  trainerNote?: string;

  @Column({ type: 'timestamp', nullable: true })
  trainerNoteAt?: Date;

  @ManyToOne(
    () => User,
    { onDelete: 'CASCADE' }
  )
  user: Relation<User>;
}
