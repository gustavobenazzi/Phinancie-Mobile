import React from "react";
import { Text } from "react-native";
import { render, act } from "@testing-library/react-native";
import DashboardScreen from "../DashboardScreen.jsx";
import useTransactionsTotals from "../../hooks/useTransactionsTotals.js";

const mockHeader = jest.fn(() => <Text testID="mock-header">Header</Text>);
const mockSummaryCard = jest.fn(({ totals, loading }) => (
  <Text testID="mock-summary">{`${totals.income}-${totals.expense}-${loading}`}</Text>
));
const mockTransactionsList = jest.fn(() => <Text testID="mock-transactions">Transactions</Text>);
const mockFocusEffect = jest.fn();

jest.mock("../../components/Header.jsx", () => ({
  __esModule: true,
  default: (props) => mockHeader(props),
}));

jest.mock("../../components/SummaryCard.jsx", () => ({
  __esModule: true,
  default: (props) => mockSummaryCard(props),
}));

jest.mock("../../components/TransactionsList.jsx", () => ({
  __esModule: true,
  default: (props) => mockTransactionsList(props),
}));

jest.mock("../../hooks/useTransactionsTotals.js", () => jest.fn());
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback) => mockFocusEffect(callback),
}));

describe("DashboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusEffect.mockReset();
    useTransactionsTotals.mockReturnValue({
      totals: { income: 1500, expense: 400 },
      loading: false,
      refreshTotals: jest.fn(),
    });
  });

  it("renderiza Header, SummaryCard e TransactionsList com dados corretos", () => {
    const { getByTestId } = render(<DashboardScreen />);

    expect(getByTestId("mock-header")).toBeTruthy();
    expect(getByTestId("mock-summary")).toBeTruthy();
    expect(getByTestId("mock-transactions")).toBeTruthy();

    const summaryProps = mockSummaryCard.mock.calls[0][0];
    expect(summaryProps.totals).toEqual({ income: 1500, expense: 400 });
    expect(summaryProps.loading).toBe(false);

    const transactionsProps = mockTransactionsList.mock.calls[0][0];
    expect(transactionsProps.limit).toBe(3);
  });

  it("chama refreshTotals quando a tela ganha foco", () => {
    const refreshSpy = jest.fn();
    useTransactionsTotals.mockReturnValue({
      totals: { income: 1000, expense: 250 },
      loading: true,
      refreshTotals: refreshSpy,
    });

    render(<DashboardScreen />);

    const focusCallback = mockFocusEffect.mock.calls[0]?.[0];
    act(() => {
      focusCallback?.();
    });

    expect(refreshSpy).toHaveBeenCalled();
  });
});
