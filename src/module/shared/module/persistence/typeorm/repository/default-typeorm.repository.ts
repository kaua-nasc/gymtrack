import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import {
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class DefaultTypeOrmRepository<T extends DefaultEntity<T>> {
  protected repository: Repository<T>;
  constructor(
    readonly entity: EntityTarget<T>,
    readonly manager: EntityManager
  ) {
    this.repository = manager.getRepository(entity);
  }

  async save(entity: T): Promise<T> {
    try {
      return await this.repository.save(entity);
    } catch {
      return await this.repository.save(entity);
    }
  }

  async findOneById(id: string, relations?: string[]): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
    });
  }

  async find(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findMany(options: FindManyOptions<T>): Promise<T[] | null> {
    return this.repository.find(options);
  }

  async exists(id: string): Promise<boolean> {
    return this.repository.exists({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  async existsBy(properties: FindOptionsWhere<T>): Promise<boolean> {
    return this.repository.exists({
      where: properties,
    });
  }

  async delete(options: FindOptionsWhere<T>): Promise<void> {
    await this.repository.delete(options);
  }

  async update(criteria: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>) {
    await this.repository.update(criteria, partialEntity);
  }

  async deleteAll() {
    await this.repository.delete({});
  }

  async count(criteria: FindOptionsWhere<T>): Promise<number> {
    return await this.repository.countBy(criteria);
  }

  async findManyWithCursor(
    options: FindOptionsWhere<T> = {},
    limit: number = 10,
    cursor?: string,
    orderBy: keyof T = 'createdAt' as keyof T
  ): Promise<{ data: T[]; nextCursor: string | null }> {
    const qb: SelectQueryBuilder<T> = this.repository
      .createQueryBuilder('entity')
      .where(options)
      .orderBy(`entity.${orderBy.toString()}`, 'DESC')
      .take(limit);

    if (cursor) {
      qb.andWhere(`entity.${orderBy.toString()} < :cursor`, { cursor });
    }

    const data = await qb.getMany();

    const nextCursor =
      data.length > 0 ? (data[data.length - 1][orderBy] as unknown as string) : null;

    return { data, nextCursor };
  }
}
