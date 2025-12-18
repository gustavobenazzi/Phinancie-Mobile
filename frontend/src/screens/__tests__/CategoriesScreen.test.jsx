import React from "react";
import { Alert } from "react-native";
import { render, waitFor } from "@testing-library/react-native";
import CategoriesScreen from "../CategoriesScreen.jsx";
import api from "../../services/api";

jest.mock("../../services/api", () => ({
  get: jest.fn(),
}));

describe("CategoriesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("carrega categorias e exibe ícones e tipos", async () => {
    api.get.mockResolvedValue({
      data: {
        data: [
          { id: "cat-1", name: "Salário", type: "INCOME", icon: "💼" },
          { id: "cat-2", name: "Mercado", type: "EXPENSE", icon: "🛒" },
        ],
      },
    });

    const { getByText, queryByText } = render(<CategoriesScreen />);

    expect(getByText("Carregando...")).toBeTruthy();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/categories");
      expect(getByText("Categorias")).toBeTruthy();
    });

    expect(queryByText("Carregando...")).toBeNull();
    expect(getByText("Salário")).toBeTruthy();
    expect(getByText("Mercado")).toBeTruthy();
    expect(getByText("💼")).toBeTruthy();
    expect(getByText("🛒")).toBeTruthy();
    expect(getByText("Receita")).toBeTruthy();
    expect(getByText("Despesa")).toBeTruthy();
  });

  it("exibe mensagem de lista vazia quando não há categorias", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    const { getByText } = render(<CategoriesScreen />);

    await waitFor(() => {
      expect(getByText("Nenhuma categoria encontrada")).toBeTruthy();
    });
  });

  it("mostra alerta quando a requisição falha", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    api.get.mockRejectedValue(new Error("network"));

    const { getByText } = render(<CategoriesScreen />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Erro", "Erro ao carregar categorias");
      expect(getByText("Nenhuma categoria encontrada")).toBeTruthy();
    });

    alertSpy.mockRestore();
  });
});
