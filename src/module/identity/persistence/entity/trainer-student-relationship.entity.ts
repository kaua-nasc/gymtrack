import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'trainer_student_relationships' })
export class TrainerStudentRelationship extends DefaultEntity<TrainerStudentRelationship> {
  @Column({ type: 'uuid' })
  trainerId: string;

  @Column({ type: 'uuid', unique: true })
  studentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'trainerId' })
  trainer: User;

  @OneToOne(() => User)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  linkedAt: Date;
}
