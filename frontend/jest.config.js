/** @type {import('jest').Config} */
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest']
  },
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  globals: {
    Request: Request,
    Response: Response,
    Headers: Headers,
    fetch: fetch
  },
  testTimeout: 30000 // Set default timeout to 30 seconds
};
