import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { SubscriptionModel } from '@src/module/billing/core/model/subscription.model';
import { Subscription } from '../entity/subscription.entity';

@Injectable()
export class SubscriptionRepository extends DefaultTypeOrmRepository<Subscription> {
  constructor(@Inject(DataSource) readonly dataSource: DataSource) {
    super(Subscription, dataSource);
  }

  async findByUserId(userId: string) {
    return await this.findOneBy({ userId });
  }
}
