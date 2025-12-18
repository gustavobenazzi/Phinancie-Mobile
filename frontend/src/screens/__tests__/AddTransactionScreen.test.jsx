import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AddTransactionScreen from "../AddTransactionScreen.jsx";
import api from "../../services/api";

jest.mock("../../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe("AddTransactionScreen", () => {
  const categories = [
    { id: "cat-1", name: "Salário", type: "INCOME", icon: "Money" },
    { id: "cat-2", name: "Mercado", type: "EXPENSE", icon: "Bag" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: categories } });
  });

  it("carrega categorias e permite seleção via modal", async () => {
    const { getByText } = render(<AddTransactionScreen />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/categories");
    });

    const openModalButton = getByText("Selecione uma categoria");
    fireEvent.press(openModalButton);

    const option = await waitFor(() => getByText("Mercado"));
    fireEvent.press(option);

    expect(getByText("Mercado")).toBeTruthy();
  });

  it("exibe alerta quando campos obrigatórios não estão preenchidos", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

    const { getByText } = render(<AddTransactionScreen />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    fireEvent.press(getByText("Salvar"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Erro", "Preencha todos os campos obrigatórios");
    });

    alertSpy.mockRestore();
  });

  it("salva transação com sucesso e navega de volta", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    api.post.mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(<AddTransactionScreen />);

    await waitFor(() => expect(api.get).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText("R$ 0,00"), "123,45");
    fireEvent.press(getByText("Receita"));
    fireEvent.press(getByText("Selecione uma categoria"));

    const categoryOption = await waitFor(() => getByText("Salário"));
    fireEvent.press(categoryOption);

    fireEvent.changeText(getByPlaceholderText("DD/MM/AAAA"), "10/10/2024");
    fireEvent.changeText(getByPlaceholderText("HH:MM"), "08:30");
    fireEvent.changeText(getByPlaceholderText("Nome do local"), "Padaria");

    fireEvent.press(getByText("Salvar"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/transactions",
        expect.objectContaining({
          amount: 123.45,
          type: "INCOME",
          categoryId: "cat-1",
          establishment: "Padaria",
          date: expect.any(String),
        })
      );
      expect(alertSpy).toHaveBeenCalledWith("Sucesso", "Transação registrada com sucesso");
      expect(mockGoBack).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  it("mostra erro quando API falha ao salvar", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    api.post.mockRejectedValue(new Error("fail"));

    const { getByPlaceholderText, getByText } = render(<AddTransactionScreen />);

    await waitFor(() => expect(api.get).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText("R$ 0,00"), "50,00");
    fireEvent.press(getByText("Selecione uma categoria"));
    const option = await waitFor(() => getByText("Mercado"));
    fireEvent.press(option);
    fireEvent.changeText(getByPlaceholderText("DD/MM/AAAA"), "11/11/2024");
    fireEvent.changeText(getByPlaceholderText("HH:MM"), "12:10");

    fireEvent.press(getByText("Salvar"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith("Erro", "Não foi possível salvar a transação");
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
