import { jest } from "@jest/globals";

const createDelegates = () => ({
  findUnique: jest.fn(),
  findFirst: jest.fn(),
  findMany: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteMany: jest.fn(),
  count: jest.fn(),
});

export const prismaMock = {
  user: createDelegates(),
  passwordResetToken: createDelegates(),
  transaction: createDelegates(),
  category: createDelegates(),
  $transaction: jest.fn(async (operations) => {
    if (Array.isArray(operations)) {
      return Promise.all(operations);
    }
    return operations;
  }),
};

export const resetPrismaMock = () => {
  Object.values(prismaMock).forEach((delegate) => {
    if (typeof delegate?.mockReset === "function") {
      delegate.mockReset();
      return;
    }

    Object.values(delegate).forEach((fn) => {
      if (typeof fn?.mockReset === "function") {
        fn.mockReset();
      }
    });
  });
};
