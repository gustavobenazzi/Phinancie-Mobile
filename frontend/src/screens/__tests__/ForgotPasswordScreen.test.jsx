import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ForgotPasswordScreen from "../ForgotPasswordScreen.jsx";

const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

describe("ForgotPasswordScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exibe mensagem de construção", () => {
    const { getByText } = render(<ForgotPasswordScreen />);

    expect(getByText("Recuperar senha")).toBeTruthy();
    expect(getByText("Tela de recuperação (em construção)")).toBeTruthy();
  });

  it("volta para a tela anterior ao tocar em Voltar", () => {
    const { getByText } = render(<ForgotPasswordScreen />);

    fireEvent.press(getByText("Voltar"));

    expect(mockGoBack).toHaveBeenCalled();
  });
});
