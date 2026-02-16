import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, ManyToOne, type Relation } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_follows' })
export class UserFollows extends DefaultEntity<UserFollows> {
  @Column({ type: 'uuid' })
  followerId: string;

  @Column({ type: 'uuid' })
  followingId: string;

  @ManyToOne(
    () => User,
    (user) => user.following,
    {
      onDelete: 'CASCADE',
    }
  )
  follower: Relation<User>;

  @ManyToOne(
    () => User,
    (user) => user.followers,
    {
      onDelete: 'CASCADE',
    }
  )
  following: Relation<User>;
}
