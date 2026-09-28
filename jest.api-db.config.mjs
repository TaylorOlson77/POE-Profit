import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  // Real Prisma against Neon. Not part of npm run test:api (ADR-019 folder, separate config).
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/api/db/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  maxWorkers: 1,
  testTimeout: 60_000,
};

export default createJestConfig(config);
