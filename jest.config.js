const fs = require('fs');

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  // Ignore every file and folder except src.
  testPathIgnorePatterns: [...fs.readdirSync(__dirname).filter((name) => name != 'src')],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: {
        types: ['./node_modules/@types/jest'],
        esModuleInterop: true,
      },
    },
  },
};
