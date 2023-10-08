module.exports = {
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  testEnvironment: 'node',
};
