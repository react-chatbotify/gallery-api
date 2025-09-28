module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
