import React from "react";
import { render, waitFor, act } from "@testing-library/react-native";
import useTransactionsTotals, { aggregateTotals } from "../useTransactionsTotals.js";
import api from "../../services/api.js";

jest.mock("../../services/api.js", () => ({
  get: jest.fn(),
}));

const sampleTransactions = [
  { id: "1", amount: 1000, type: "INCOME" },
  { id: "2", amount: -200, type: "EXPENSE" },
  { id: "3", amount: 500, type: "INCOME" },
  { id: "4", amount: 150, type: "EXPENSE" },
];

describe("aggregateTotals", () => {
  it("soma receitas e despesas corretamente", () => {
    const result = aggregateTotals(sampleTransactions);
    expect(result).toEqual({ income: 1500, expense: 350 });
  });
});

describe("useTransactionsTotals", () => {
  let hookResult;
  const Harness = ({ autoFetch }) => {
    hookResult = useTransactionsTotals({ autoFetch });
    return null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    hookResult = null;
  });

  it("busca totais automaticamente quando autoFetch está habilitado", async () => {
    api.get.mockResolvedValueOnce({ data: { data: sampleTransactions } });

    render(<Harness autoFetch />);

    expect(api.get).toHaveBeenCalledWith("/transactions");

    await waitFor(() => expect(hookResult?.loading).toBe(false));
    expect(hookResult.totals).toEqual({ income: 1500, expense: 350 });
  });

  it("permite atualizar manualmente quando autoFetch está desabilitado", async () => {
    api.get.mockResolvedValue({ data: { data: sampleTransactions } });

    render(<Harness autoFetch={false} />);

    expect(api.get).not.toHaveBeenCalled();
    expect(hookResult.loading).toBe(false);

    await act(async () => {
      await hookResult.refreshTotals();
    });

    expect(api.get).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(hookResult.totals).toEqual({ income: 1500, expense: 350 }));
  });
});
