import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserFollows } from './user-follows.entity';

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
}
