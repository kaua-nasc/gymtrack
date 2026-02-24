import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';
import {
  Brackets,
  EntityManager,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

export interface Cursor {
  value: string | number | Date;
  id: string;
}

export abstract class DefaultTypeOrmRepository<T extends DefaultEntity<T>> {
  protected repository: Repository<T>;
  constructor(
    readonly entity: EntityTarget<T>,
    readonly manager: EntityManager,
    protected readonly logger: AppLogger
  ) {
    this.repository = manager.getRepository(entity);
  }

  async save(entity: T): Promise<T> {
    try {
      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error(
        `Error saving entity ${this.repository.metadata.name}`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async findOneById(id: string, relations?: string[]): Promise<T | null> {
    try {
      return await this.repository.findOne({
        where: { id } as unknown as FindOptionsWhere<T>,
        relations,
      });
    } catch (error) {
      this.logger.error(
        `Error finding entity ${this.repository.metadata.name} by id ${id}`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async find(options: FindOneOptions<T>): Promise<T | null> {
    try {
      return await this.repository.findOne(options);
    } catch (error) {
      this.logger.error(
        `Error finding entity ${this.repository.metadata.name}`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async findMany(options: FindManyOptions<T>): Promise<T[] | null> {
    try {
      return await this.repository.find(options);
    } catch (error) {
      this.logger.error(
        `Error finding many entities ${this.repository.metadata.name}`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      return await this.repository.exists({
        where: { id } as unknown as FindOptionsWhere<T>,
      });
    } catch (error) {
      this.logger.error(
        `Error checking existence of entity ${this.repository.metadata.name} by id ${id}`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async existsBy(properties: FindOptionsWhere<T>): Promise<boolean> {
    try {
      return await this.repository.exists({
        where: properties,
      });
    } catch (error) {
      this.logger.error(
        `Error checking existence of entity ${this.repository.metadata.name} by properties`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async delete(options: FindOptionsWhere<T>): Promise<void> {
    try {
      await this.repository.softDelete(options);
    } catch (error) {
      this.logger.error(
        `Error deleting entity ${this.repository.metadata.name}`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async update(criteria: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>) {
    try {
      await this.repository.update(criteria, partialEntity);
    } catch (error) {
      this.logger.error(
        `Error updating entity ${this.repository.metadata.name}`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async deleteAll() {
    try {
      await this.repository.delete({});
    } catch (error) {
      this.logger.error(
        `Error deleting all entities ${this.repository.metadata.name}`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async count(criteria: FindOptionsWhere<T>): Promise<number> {
    try {
      return await this.repository.countBy(criteria);
    } catch (error) {
      this.logger.error(
        `Error counting entities ${this.repository.metadata.name}`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }

  async findManyWithCursor(
    options: FindOptionsWhere<T> | FindOptionsWhere<T>[] = {},
    limit: number = 10,
    cursor?: Cursor,
    orderBy: keyof T = 'createdAt' as keyof T,
    relations?: FindOptionsRelations<T>
  ): Promise<{ data: T[]; nextCursor: Cursor | null }> {
    try {
      const qb = this.repository.createQueryBuilder('entity');

      qb.setFindOptions({
        where: options,
        relations: relations,
        order: {
          [orderBy]: 'DESC',
          id: 'DESC',
        } as unknown as FindOptionsOrder<T>,
        take: limit,
      });

      if (cursor) {
        qb.andWhere(
          new Brackets((or) => {
            or.where(`entity.${String(orderBy)} < :val`, { val: cursor.value }).orWhere(
              `entity.${String(orderBy)} = :val AND entity.id < :id`,
              { val: cursor.value, id: cursor.id }
            );
          })
        );
      }

      const data = await qb.getMany();

      const nextCursor =
        data.length === limit
          ? {
              value: data[data.length - 1][orderBy] as unknown as string | number | Date,
              id: (data[data.length - 1] as unknown as DefaultEntity<T>).id,
            }
          : null;

      return { data, nextCursor };
    } catch (error) {
      this.logger.error(
        `Error finding many entities ${this.repository.metadata.name} with cursor`,
        error instanceof Error ? error.stack : undefined,
        this.repository.metadata.name
      );
      throw error;
    }
  }
}
