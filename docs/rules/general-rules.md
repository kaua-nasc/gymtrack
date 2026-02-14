# 🧠 GymTrack Global Rules & Policies

**Parent Document:** [Architecture Rules](./architecture-rules.md)

This document outlines global standards for cross-cutting concerns like error handling, transactions, and logging. These rules ensure consistency and robustness across all modules.

---

### 🚨 Error Handling: Domain-First Strategy

Our error handling strategy decouples business logic from the transport layer (HTTP). Services should have no knowledge of HTTP status codes.

**Core Principle**: Services throw **Domain Exceptions**; a global filter translates them into **HTTP Exceptions**.

**Flow**: `Service (throws custom DomainException) → GlobalHttpExceptionFilter → NestJS (sends standard HTTP response)`

#### 1. Define Custom Domain Exceptions

Create specific, named exceptions for business rule violations.

```typescript
// src/module/identity/core/exception/user-not-found.exception.ts
export class UserNotFoundException extends Error {
  constructor(userId: string) {
    super(`User with ID '${userId}' was not found.`);
    this.name = 'UserNotFoundException';
  }
}
```

#### 2. Throw Exceptions in Services

Services should throw these custom exceptions when a business rule is violated.

```typescript
// user-management.service.ts
async function findUser(userId: string): Promise<User> {
  const user = await this.userRepository.findById(userId);
  if (!user) {
    // Throw the specific domain exception
    throw new UserNotFoundException(userId);
  }
  return user;
}
```

#### 3. Implement a Global Exception Filter

A single global filter, applied in `main.ts`, is responsible for catching all exceptions and formatting the HTTP response. **This is the standard to be implemented.**

```typescript
// src/module/shared/http/filter/global-http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserNotFoundException } from '@src/module/identity/core/exception/user-not-found.exception';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred.';

    // Handle specific domain exceptions
    if (exception instanceof UserNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    }
    // Handle standard NestJS HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }
    // Log the full error for debugging (especially for 500s)
    // this.logger.error(exception);

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

---

### 🔄 Transaction Management

Transactions are owned exclusively by the **Service** layer to ensure atomicity across one or more repository calls.

*   **Rule**: Repositories must be transaction-agnostic. They receive an `EntityManager` and operate on it, without knowing if they are in a transaction.
*   **Pattern**: Use `dataSource.transaction()` to wrap operations.

```typescript
// some.service.ts
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SomeService {
  constructor(
    @InjectDataSource('identity') private readonly dataSource: DataSource,
    private readonly userRepository: UserRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async createUserWithProfile(data: CreateUserDto): Promise<User> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // Pass the transactional manager to repository methods
      const user = await this.userRepository.create(data, transactionalEntityManager);
      await this.profileRepository.create({ userId: user.id }, transactionalEntityManager);
      return user;
    });
  }
}
```

---

### 📣 Domain Events for Decoupling

Use domain events to handle side effects (e.g., sending an email, updating a search index) without coupling them to the original transaction. This project uses `@nestjs/event-emitter`.

*   **Rule**: Emit events **after** the primary transaction has successfully completed.

```typescript
// auth.service.ts
async register(dto: RegisterDto): Promise<User> {
  const user = await this.userRepository.create(dto);

  // Emit an event after the user is successfully created
  this.eventEmitter.emit('user.created', new UserCreatedEvent(user.id, user.email));

  return user;
}

// somewhere else in the codebase
// @OnEvent('user.created')
// handleUserCreatedEvent(payload: UserCreatedEvent) {
//   // Send a welcome email, etc.
// }
```

---

### ⚙️ Environment & Configuration

Configuration must be type-safe and centrally managed.

*   **Rule**: **Never** use `process.env` directly. Always inject `ConfigService`.
*   **Validation**: Environment variables **must** be validated using **Zod** within the `ConfigModule` to ensure the application fails fast if critical configuration is missing.

```typescript
// src/module/shared/module/config/util/config.validation.ts
import { z } from 'zod';

export const configValidationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().min(1),
});
```

---

### 📦 DTOs & API Evolution

*   **Validation**: DTOs must use `class-validator` decorators for all properties.
*   **Transformation**: Enable `transform: true` in validation pipes to automatically convert incoming payloads to DTO class instances.
*   **Pagination**: For paginated lists, use a standardized query DTO.

```typescript
// src/module/shared/http/dto/pagination-query.dto.ts
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 20;
}
```

*   **Response Shape**: Paginated responses must use the shape: `{ "items": [...], "meta": { "totalItems": 100, "itemCount": 20, "itemsPerPage": 20, "currentPage": 1 } }`.

---

### 🪵 Logging

*   **PII**: It is strictly forbidden to log Personally Identifiable Information (PII), including emails, names, passwords, tokens, or any user-generated content that is not explicitly public.
*   **Levels**:
    *   `error`: For unhandled exceptions or fatal errors (includes stack trace).
    *   `warn`: For handled exceptions or potential issues (e.g., API deprecation).
    *   `log`: For significant application lifecycle events (e.g., service startup).
    *   `debug`: For detailed diagnostic information during development.
