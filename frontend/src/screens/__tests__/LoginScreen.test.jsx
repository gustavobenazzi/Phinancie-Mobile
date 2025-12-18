import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "../LoginScreen";
import api from "../../services/api";

jest.mock("../../services/api", () => ({
  post: jest.fn(),
}));

const mockReplace = jest.fn();
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({
      replace: mockReplace,
      navigate: mockNavigate,
    }),
  };
});

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.multiSet.mockClear();
    AsyncStorage.multiRemove.mockClear();
  });

  it("exibe alerta quando campos obrigatórios estão vazios", () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Entrar"));

    expect(alertSpy).toHaveBeenCalledWith("Erro", "Preencha todos os campos");
    alertSpy.mockRestore();
  });

  it("realiza login com sucesso, salva dados e navega para MainTabs", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const email = "user@teste.com";
    const password = "Senha@123";
    const token = "token-123";
    const user = { id: "user-1", name: "Tester" };
    api.post.mockResolvedValue({ data: { data: { token, user } } });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("Email"), email);
    fireEvent.changeText(getByPlaceholderText("Senha"), password);

    fireEvent.press(getByText("Lembrar login"));
    fireEvent.press(getByText("Entrar"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", { email, password });
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith("authToken", token);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("user", JSON.stringify(user));
    expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
      ["rememberLogin", "true"],
      ["savedEmail", email],
      ["savedPassword", password],
    ]);
    expect(mockReplace).toHaveBeenCalledWith("MainTabs");
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it("mostra erro vindo da API ao falhar login", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const email = "user@teste.com";
    const password = "Senha@123";
    const apiError = "Credenciais inválidas";
    api.post.mockRejectedValue({ response: { data: { error: apiError } } });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByPlaceholderText("Email"), email);
    fireEvent.changeText(getByPlaceholderText("Senha"), password);

    fireEvent.press(getByText("Entrar"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Erro", apiError);
    });

    expect(mockReplace).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
