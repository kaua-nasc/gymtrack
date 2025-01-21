import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from '@src/module/identity/core/service/user-management.service';
import { UserRepository } from '@src/module/identity/persistence/repository/user.repository';
import { ConfigModule } from '@src/shared/module/config/config.module';
import { TypeOrmMigrationService } from '@src/shared/module/persistence/typeorm/service/typeorm-migration.service';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [UserManagementService, UserRepository, TypeOrmMigrationService],
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('create', () => {
    it('creates a new user', async () => {
      const user = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      };

      jest.spyOn(userRepository, 'save').mockResolvedValueOnce();

      const createdUser = await service.create(user);
      const { email, firstName, lastName } = createdUser;

      expect(email).toEqual(user.email);
      expect(firstName).toEqual(user.firstName);
      expect(lastName).toEqual(user.lastName);
    });
  });
});
