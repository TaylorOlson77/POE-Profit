import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  // API / integration tests live under tests/api/ (ADR-019). Separate from unit + Playwright.
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/api/**/*.test.ts"],
  // Persistence round-trips live in tests/api/db and run via jest.api-db.config.mjs.
  testPathIgnorePatterns: ["<rootDir>/tests/api/db/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
