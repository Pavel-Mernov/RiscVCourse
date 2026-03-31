module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  transform: {
    '^.+\\.ts?$': ['ts-jest', {}]
  },

  testMatch: ["**/tests/**/*.test.ts", "**/*.spec.ts"],

  setupFiles: ['<rootDir>/src/tests/setup.ts'],
};