import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import { Column, Entity, JoinColumn, OneToOne, type Relation  } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_privacy_settings' })
export class UserPrivacySettings extends DefaultEntity<UserPrivacySettings> {
  @OneToOne(() => User, (user) => user.privacySettings, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Relation<User>;

  @Column({ default: true })
  shareName: boolean;

  @Column({ default: true })
  shareEmail: boolean;

  @Column({ default: false })
  shareTrainingProgress: boolean;
}
