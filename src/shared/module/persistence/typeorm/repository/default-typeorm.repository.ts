import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

//TODO change to hide typeorm repository, stop using inheritance
export abstract class DefaultTypeOrmRepository<
  T extends ObjectLiteral,
> extends Repository<T> {
  constructor(
    readonly model: EntityTarget<T>,
    readonly dataSource: DataSource
  ) {
    super(model, dataSource.createEntityManager());
  }

  async deleteAll(): Promise<void> {
    const repository = this.dataSource.getRepository(this.model);
    const entities = await repository.find();
    await repository.remove(entities);
  }
}
