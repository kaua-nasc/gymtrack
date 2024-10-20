import config from './jest.shared';

export default {
  ...config,
  testMatch: ['<rootDir>/src/**/__test__/e2e/**/*.spec.ts'],
  globalSetup: '<rootDir>/test/migration-setup.ts',
  setupFilesAfterEnv: ['<rootDir>/test/migration-setup.ts'],
};
