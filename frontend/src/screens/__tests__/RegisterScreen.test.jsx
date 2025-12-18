import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import RegisterScreen from "../RegisterScreen.jsx";
import api from "../../services/api";

jest.mock("../../services/api", () => ({
  post: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("RegisterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillCommonFields = (utils) => {
    fireEvent.changeText(utils.getByPlaceholderText("Nome"), "Tester");
    fireEvent.changeText(utils.getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(utils.getByPlaceholderText("CPF"), "12345678901");
    fireEvent.changeText(utils.getByPlaceholderText("Senha"), "Senha@123");
    fireEvent.changeText(utils.getByPlaceholderText("Confirme sua senha"), "Senha@123");
  };

  it("valida campos obrigatórios", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const { getByText } = render(<RegisterScreen />);

    fireEvent.press(getByText("Registrar"));

    expect(alertSpy).toHaveBeenCalledWith("Erro", "Preencha todos os campos");
    alertSpy.mockRestore();
  });

  it("mostra erro quando senhas não conferem", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const utils = render(<RegisterScreen />);

    fireEvent.changeText(utils.getByPlaceholderText("Nome"), "Tester");
    fireEvent.changeText(utils.getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(utils.getByPlaceholderText("CPF"), "12345678901");
    fireEvent.changeText(utils.getByPlaceholderText("Senha"), "Senha@123");
    fireEvent.changeText(utils.getByPlaceholderText("Confirme sua senha"), "OutraSenha");

    fireEvent.press(utils.getByText("Registrar"));

    expect(alertSpy).toHaveBeenCalledWith("Erro", "As senhas não conferem");
    alertSpy.mockRestore();
  });

  it("envia dados, mostra sucesso e navega para login", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    api.post.mockResolvedValue({});

    const utils = render(<RegisterScreen />);
    fillCommonFields(utils);

    fireEvent.press(utils.getByText("Registrar"));
    expect(utils.getByText("Registrando...")).toBeTruthy();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/users", {
        name: "Tester",
        email: "test@example.com",
        password: "Senha@123",
      });
      expect(alertSpy).toHaveBeenCalledWith("Sucesso", "Conta criada com sucesso. Faça login.");
      expect(mockNavigate).toHaveBeenCalledWith("Login");
    });

    alertSpy.mockRestore();
  });

  it("propaga mensagem de erro do backend", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    api.post.mockRejectedValue({ response: { data: { error: "Email já usado" } } });

    const utils = render(<RegisterScreen />);
    fillCommonFields(utils);

    fireEvent.press(utils.getByText("Registrar"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith("Erro", "Email já usado");
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });
});
