import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../SettingsScreen.jsx";
import api from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("../../services/api", () => ({
  delete: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  multiRemove: jest.fn(),
}));

const mockReset = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    reset: mockReset,
  }),
}));

const setupAlertWithAutoConfirm = () =>
  jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
    if (Array.isArray(buttons)) {
      const confirmButton = buttons.find((btn) => btn.style === "destructive") || buttons[buttons.length - 1];
      confirmButton?.onPress?.();
    }
  });

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("limpa todas as transações após confirmação", async () => {
    api.delete.mockResolvedValue({});
    const alertSpy = setupAlertWithAutoConfirm();

    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("Limpar todas transações"));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/transactions");
      const successCall = alertSpy.mock.calls.find(([title]) => title === "Tudo certo");
      expect(successCall).toBeTruthy();
      expect(successCall[1]).toBe("Todas as transações foram removidas.");
    });

    alertSpy.mockRestore();
  });

  it("mostra erro quando falha ao limpar categorias", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    api.delete.mockRejectedValue({ response: { data: { error: "Falha" } } });
    const alertSpy = setupAlertWithAutoConfirm();

    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("Limpar todas categorias"));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/categories");
      const errorCall = alertSpy.mock.calls.find(([title]) => title === "Erro");
      expect(errorCall).toBeTruthy();
      expect(errorCall[1]).toBe("Falha");
    });

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("desloga usuário após confirmar ação", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
      if (title === "Sair da conta" && Array.isArray(buttons)) {
        const confirmButton = buttons.find((btn) => btn.text === "Sair");
        confirmButton?.onPress?.();
      }
    });

    const { getByText } = render(<SettingsScreen />);

    fireEvent.press(getByText("Deslogar"));

    await waitFor(() => {
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(["authToken", "user"]);
      expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: "Login" }] });
    });

    alertSpy.mockRestore();
  });
});
