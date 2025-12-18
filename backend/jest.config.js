export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  collectCoverageFrom: ["src/**/*.js"],
};
