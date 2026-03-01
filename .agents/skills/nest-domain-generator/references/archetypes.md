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

  @Column({ type: 'text', nullable: true })
  description?: string;
}
```

## 📦 2. Repository (`persistence/repository/`)

Must extend `DefaultTypeOrmRepository`.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DefaultTypeOrmRepository } from '@src/module/shared/module/persistence/typeorm/repository/default-typeorm.repository';
import { MyEntity } from '../entity/my.entity';

@Injectable()
export class MyRepository extends DefaultTypeOrmRepository<MyEntity> {
  constructor(
    @InjectDataSource('{domain}') // e.g., 'identity' or 'training-plan'
    private readonly dataSource: DataSource,
  ) {
    super(MyEntity, dataSource.createEntityManager());
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
