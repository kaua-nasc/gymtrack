import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User extends DefaultEntity<User> {
  @PrimaryColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
