import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, OneToMany, OneToOne, type Relation } from 'typeorm';
import { HeightUnit } from '../../core/enum/height-unit.enum';
import { UserType } from '../../core/enum/user-type.enum';
import { WeightUnit } from '../../core/enum/weight-unit.enum';
import { UserFollows } from './user-follows.entity';
import { UserPrivacySettings } from './user-privacy-settings.entity';
import { TrainerStudentRelationship } from './trainer-student-relationship.entity';

@Entity({ name: 'users' })
export class User extends DefaultEntity<User> {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'text', nullable: true })
  profilePictureUrl?: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserType, nullable: false, default: UserType.client })
  type: UserType;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? Number(value) : value),
    },
  })
  height?: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? Number(value) : value),
    },
  })
  currentWeight?: number;

  @Column({ type: 'enum', enum: WeightUnit, default: WeightUnit.kg })
  weightUnit: WeightUnit;

  @Column({ type: 'enum', enum: HeightUnit, default: HeightUnit.cm })
  heightUnit: HeightUnit;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  trainerInviteCode?: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  cref?: string;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @OneToMany(
    () => UserFollows,
    (follow) => follow.following
  )
  followers: UserFollows[];

  @OneToMany(
    () => UserFollows,
    (follow) => follow.follower
  )
  following: UserFollows[];

  @OneToOne(
    () => UserPrivacySettings,
    (settings) => settings.user,
    { cascade: true }
  )
  privacySettings: Relation<UserPrivacySettings>;

  @OneToMany(
    () => TrainerStudentRelationship,
    (relationship) => relationship.trainer
  )
  students: TrainerStudentRelationship[];

  @OneToOne(
    () => TrainerStudentRelationship,
    (relationship) => relationship.student
  )
  trainerRelationship: Relation<TrainerStudentRelationship>;

  isFollowing?: boolean;
}
