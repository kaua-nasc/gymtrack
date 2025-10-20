import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
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

  @Column()
  password: string;

  @OneToMany(() => UserFollows, (follow) => follow.following)
  followers: UserFollows[];

  @OneToMany(() => UserFollows, (follow) => follow.follower)
  following: UserFollows[];

  @OneToOne(() => UserPrivacySettings, (settings) => settings.user, { cascade: true })
  privacySettings: UserPrivacySettings;
}
