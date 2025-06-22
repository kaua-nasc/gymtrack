import { Config } from 'jest';

const sharedConfig: Config = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '..',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@contentModule/(.*)$': '<rootDir>/src/module/content/$1',
    '^@identityModule/(.*)$': '<rootDir>/src/module/identity/$1',
    '^@sharedModules/(.*)$': '<rootDir>/src/module/shared/module/$1',
    '^@billingModule/(.*)$': '<rootDir>/src/module/billing/$1',
    '^@sharedLibs/(.*)$': '<rootDir>/src/module/shared/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@database/(.*)$': '<rootDir>/database/$1',
    '^@testInfra/(.*)$': '<rootDir>/test/$1',
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/test/test.setup.ts'],
  verbose: true,
  resetMocks: true,
};

export default sharedConfig;
