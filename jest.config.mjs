import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

/** @type {import('jest').Config} */
const config = {
  // Unit tests: colocated under src/ (ADR-019). Node env — calc is pure, not DOM.
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
};

export default createJestConfig(config);
