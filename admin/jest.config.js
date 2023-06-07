/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["<rootDir>/lib/", "<rootDir>/node_modules/"],
  verbose: true,
};

module.exports = config;
