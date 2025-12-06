import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import TransactionsList from "../TransactionsList.jsx";
import api from "../../services/api.js";

const mockFocusEffect = jest.fn();

jest.mock("../../services/api.js", () => ({
  get: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({
  useFocusEffect: (callback) => mockFocusEffect(callback),
}));

describe("TransactionsList", () => {
  const transactions = [
    {
      id: "1",
      amount: 100,
      type: "INCOME",
      category: { id: "cat-1", name: "Salário", icon: "Salary" },
      date: "2024-10-10T10:00:00.000Z",
    },
    {
      id: "2",
      amount: 50,
      type: "EXPENSE",
      category: { id: "cat-2", name: "Mercado", icon: "Bag" },
      date: "2024-10-11T11:00:00.000Z",
    },
  ];

  const categories = [
    { id: "cat-1", name: "Salário" },
    { id: "cat-2", name: "Mercado" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFocusEffect.mockReset();
    api.get.mockImplementation((url) => {
      if (url === "/transactions") {
        return Promise.resolve({ data: { data: transactions } });
      }
      if (url === "/categories") {
        return Promise.resolve({ data: { data: categories } });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  it("renderiza lista com transações", async () => {
    const { getByText } = render(<TransactionsList />);

    const focusCallback = mockFocusEffect.mock.calls[0]?.[0];
    await act(async () => {
      focusCallback?.();
    });

    await waitFor(() => {
      expect(getByText("Salário")).toBeTruthy();
      expect(getByText("Mercado")).toBeTruthy();
    });
  });

  it("filtra por categoria através do modal", async () => {
    const { getByText, getAllByText, queryByText } = render(<TransactionsList />);

    const focusCallback = mockFocusEffect.mock.calls[0]?.[0];
    await act(async () => {
      focusCallback?.();
    });

    await waitFor(() => getByText("Salário"));

    fireEvent.press(getByText(/Categoria:/));
    await waitFor(() => expect(getAllByText("Mercado").length).toBeGreaterThan(1));

    const modalOption = getAllByText("Mercado").pop();
    fireEvent.press(modalOption);

    await waitFor(() => {
      expect(getByText("Mercado")).toBeTruthy();
      expect(queryByText("Salário")).toBeNull();
    });
  });

  it("mostra mensagem quando não há transações", async () => {
    api.get.mockImplementation((url) => {
      if (url === "/transactions") {
        return Promise.resolve({ data: { data: [] } });
      }
      if (url === "/categories") {
        return Promise.resolve({ data: { data: categories } });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    const { getByText } = render(<TransactionsList />);

    const focusCallback = mockFocusEffect.mock.calls[0]?.[0];
    await act(async () => {
      focusCallback?.();
    });

    await waitFor(() => {
      expect(getByText("Nenhuma transação encontrada.")).toBeTruthy();
    });
  });
});
