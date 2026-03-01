# 🧬 NestJS Code Archetypes

This document provides standardized boilerplate for each layer of the modular architecture.

## 🏗️ 1. Entity (`persistence/entity/`)

Must extend `DefaultEntity`.

```typescript
import { Column, Entity } from 'typeorm';
import { DefaultEntity } from '@src/module/shared/module/persistence/typeorm/entity/default.entity';

@Entity('table_name')
export class MyEntity extends DefaultEntity {
  @Column()
  name: string;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? Number(value) : value),
    },
  })
  value: number;
}
```

## 📦 2. Repository (`persistence/repository/`)

Must extend `DefaultTypeOrmRepository`. Provide **semantic methods** to keep the service layer clean.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere } from 'typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { MyEntity } from '../entity/my.entity';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

@Injectable()
export class MyRepository extends DefaultTypeOrmRepository<MyEntity> {
  constructor(
    @InjectDataSource('{domain}') dataSource: DataSource,
    logger: AppLogger
  ) {
    super(MyEntity, dataSource.createEntityManager(), logger);
  }

  async findByCustomCriteria(userId: string): Promise<MyEntity[]> {
    const where: FindOptionsWhere<MyEntity> = { userId };
    return this.repository.find({ where });
  }
}
```

## ⚙️ 3. Service (`core/service/`)

Implements business logic and manages transactions.

```typescript
import { Injectable } from '@nestjs/common';
import { MyRepository } from '../../persistence/repository/my.repository';
import { MyEntity } from '../../persistence/entity/my.entity';

@Injectable()
export class MyService {
  constructor(private readonly myRepository: MyRepository) {}

  async create(dto: any): Promise<MyEntity> {
    const entity = this.myRepository.create(dto);
    return this.myRepository.save(entity);
  }

  async findById(id: string): Promise<MyEntity> {
    const entity = await this.myRepository.findOneBy({ id });
    if (!entity) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return entity;
  }
}
```

## 🎮 4. Controller (`http/rest/controller/`)

The HTTP entry point. Handles Swagger documentation and DTO validation.

```typescript
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MyService } from '../../../core/service/my.service';

@ApiTags('My Feature')
@Controller('my-feature')
export class MyController {
  constructor(private readonly myService: MyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new feature record' })
  async create(@Body() dto: any): Promise<any> {
    return this.myService.create(dto);
  }
}
```
