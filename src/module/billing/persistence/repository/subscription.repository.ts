import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DefaultTypeOrmRepository } from '@src/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { Subscription } from '@src/module/billing/persistence/entity/subscription.entity';
import { SubscriptionModel } from '../../core/model/subscription.model';

@Injectable()
export class SubscriptionRepository extends DefaultTypeOrmRepository<Subscription> {
  constructor(readonly transactionalEntityManager: EntityManager) {
    super(Subscription, transactionalEntityManager);
  }

  async findByUserId(userId: string) {
    return await this.findOneById(userId);
  }

  async saveSubscription(entity: SubscriptionModel) {
    const subscription = new Subscription({ ...entity });

    await super.save(subscription);
  }
}
