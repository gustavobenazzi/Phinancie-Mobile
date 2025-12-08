import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import TransactionsScreen from "../TransactionsScreen.jsx";

const mockHeader = jest.fn(() => <Text testID="header-mock">Header</Text>);
const mockSummary = jest.fn(() => <Text testID="summary-mock">Summary</Text>);
const mockList = jest.fn(() => <Text testID="list-mock">List</Text>);

jest.mock("../../components/Header.jsx", () => ({
  __esModule: true,
  default: (props) => mockHeader(props),
}));

jest.mock("../../components/SummaryCard.jsx", () => ({
  __esModule: true,
  default: (props) => mockSummary(props),
}));

jest.mock("../../components/TransactionsList.jsx", () => ({
  __esModule: true,
  default: (props) => mockList(props),
}));

jest.mock("@react-navigation/bottom-tabs", () => ({
  useBottomTabBarHeight: () => 32,
}));

jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  return {
    ...actual,
    useSafeAreaInsets: () => ({ bottom: 0 }),
  };
});

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("TransactionsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza componentes principais", () => {
    const { getByTestId } = render(<TransactionsScreen />);

    expect(getByTestId("header-mock")).toBeTruthy();
    expect(getByTestId("summary-mock")).toBeTruthy();
    expect(getByTestId("list-mock")).toBeTruthy();
  });

  it("abre ações do FAB e navega conforme opção", () => {
    const { getByTestId, queryByText } = render(<TransactionsScreen />);

    expect(queryByText("Adicionar gastos manualmente")).toBeNull();

    fireEvent.press(getByTestId("transactions-fab"));
    expect(queryByText("Adicionar gastos manualmente")).toBeTruthy();

    fireEvent.press(getByTestId("fab-action-add"));
    expect(mockNavigate).toHaveBeenCalledWith("AddTransaction");
    expect(queryByText("Adicionar gastos manualmente")).toBeNull();

    fireEvent.press(getByTestId("transactions-fab"));
    fireEvent.press(getByTestId("fab-action-import"));
    expect(mockNavigate).toHaveBeenCalledWith("StatementImport");
  });
});
