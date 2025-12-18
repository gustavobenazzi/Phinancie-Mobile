import React from "react";
import { render, act } from "@testing-library/react-native";
import SummaryCard from "../SummaryCard.jsx";
import useTransactionsTotals from "../../hooks/useTransactionsTotals.js";

const mockFocusEffect = jest.fn();

jest.mock("../../hooks/useTransactionsTotals.js", () => jest.fn());
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback) => mockFocusEffect(callback),
}));

const formatBRL = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

describe("SummaryCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusEffect.mockReset();
    useTransactionsTotals.mockReturnValue({
      totals: { income: 0, expense: 0 },
      loading: false,
      refreshTotals: jest.fn(),
    });
  });

  it("usa dados externos quando fornecidos", () => {
    const totals = { income: 2000, expense: 800 };
    const { getByText, queryByTestId } = render(
      <SummaryCard totals={totals} loading={false} />
    );

    expect(queryByTestId("summary-loading")).toBeNull();
    expect(getByText(formatBRL(totals.income))).toBeTruthy();
    expect(getByText(formatBRL(totals.expense))).toBeTruthy();
  });

  it("exibe indicador de loading quando hook está carregando", () => {
    useTransactionsTotals.mockReturnValue({
      totals: { income: 0, expense: 0 },
      loading: true,
      refreshTotals: jest.fn(),
    });

    const { getByTestId } = render(<SummaryCard />);
    expect(getByTestId("summary-loading")).toBeTruthy();
  });

  it("renderiza valores após carregar e dispara refresh", () => {
    const refreshSpy = jest.fn();
    useTransactionsTotals.mockReturnValue({
      totals: { income: 1200, expense: 300 },
      loading: false,
      refreshTotals: refreshSpy,
    });

    const { getByText } = render(<SummaryCard />);

    expect(getByText(formatBRL(1200))).toBeTruthy();
    expect(getByText(formatBRL(300))).toBeTruthy();

    const focusCallback = mockFocusEffect.mock.calls[0]?.[0];
    act(() => {
      focusCallback?.();
    });

    expect(refreshSpy).toHaveBeenCalled();
  });
});
