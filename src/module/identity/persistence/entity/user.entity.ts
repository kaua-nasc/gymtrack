import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { UserType } from '../../core/enum/user-type.enum';
import { UserFollows } from './user-follows.entity';
import { UserPrivacySettings } from './user-privacy-settings.entity';

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
  privacySettings: UserPrivacySettings;
}
