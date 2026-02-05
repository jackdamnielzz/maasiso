module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
          decorators: false,
        },
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^remark-gfm$': '<rootDir>/src/__tests__/mocks/remarkGfmMock.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/src/lib/tests/',
    '<rootDir>/src/lib/testing/',
    '<rootDir>/src/lib/monitoring/__tests__/service.test.ts',
    '<rootDir>/src/lib/api/__tests__/payload-schema.test.ts',
    '<rootDir>/src/lib/api/__tests__/url-handling.test.ts',
    '<rootDir>/app/diensten/test.tsx',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
