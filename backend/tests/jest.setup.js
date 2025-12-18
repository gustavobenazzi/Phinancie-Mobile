import { afterEach, beforeAll } from "@jest/globals";
import { resetPrismaMock } from "./utils/prismaMock.js";

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
});

afterEach(() => {
  resetPrismaMock();
});
