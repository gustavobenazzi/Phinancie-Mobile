import React from "react";
import { Alert } from "react-native";
import { render, waitFor } from "@testing-library/react-native";
import GoalsScreen from "../GoalsScreen.jsx";
import api from "../../services/api";

jest.mock("../../services/api", () => ({
  get: jest.fn(),
}));

describe("GoalsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("carrega metas e exibe valores incluindo estado de expiração", async () => {
    const goals = [
      {
        id: "goal-1",
        title: "Viagem",
        value: 1000,
        endDate: "2000-01-01T00:00:00.000Z",
      },
      {
        id: "goal-2",
        title: "Reserva de emergência",
        value: 5000.5,
        endDate: "2100-01-01T00:00:00.000Z",
      },
    ];

    api.get.mockResolvedValue({ data: { data: goals } });

    const { getByText, queryByText, getAllByText } = render(<GoalsScreen />);

    expect(getByText("Carregando...")).toBeTruthy();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/goals");
      expect(getByText("Metas Financeiras")).toBeTruthy();
    });

    expect(queryByText("Carregando...")).toBeNull();
    expect(getByText("Viagem")).toBeTruthy();
    expect(getByText("R$ 1000.00")).toBeTruthy();
    expect(getByText("Reserva de emergência")).toBeTruthy();
    expect(getByText("R$ 5000.50")).toBeTruthy();

    expect(getAllByText(/Vence em:/)).toHaveLength(2);

    expect(getAllByText("Expirada")).toHaveLength(1);
  });

  it("exibe mensagem de lista vazia quando nenhuma meta é retornada", async () => {
    api.get.mockResolvedValue({ data: { data: [] } });

    const { getByText } = render(<GoalsScreen />);

    await waitFor(() => {
      expect(getByText("Nenhuma meta encontrada")).toBeTruthy();
    });
  });

  it("mostra alerta e mantém lista vazia quando a API falha", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    api.get.mockRejectedValue(new Error("network"));

    const { getByText } = render(<GoalsScreen />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Erro", "Erro ao carregar metas");
      expect(getByText("Nenhuma meta encontrada")).toBeTruthy();
    });

    alertSpy.mockRestore();
  });
});
