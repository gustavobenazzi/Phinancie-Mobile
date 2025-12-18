import React from "react";
import { renderWithProviders } from "../../../tests/utils/testUtils.jsx";
import FormScreen from "../FormScreen.jsx";
import { Text } from "react-native";

describe("FormScreen", () => {
  it("renderiza título, subtítulo e filhos", () => {
    const { getByText } = renderWithProviders(
      <FormScreen title="Bem-vindo" subtitle="Controle financeiro">
        <Text>Conteúdo interno</Text>
      </FormScreen>
    );

    expect(getByText("Bem-vindo")).toBeTruthy();
    expect(getByText("Controle financeiro")).toBeTruthy();
    expect(getByText("Conteúdo interno")).toBeTruthy();
  });

  it("aplica contentClassName customizado", () => {
    const { getByTestId } = renderWithProviders(
      <FormScreen title="Teste" contentClassName="flex-1 p-10" />
    );

    const container = getByTestId("form-screen-container");
    expect(container.props.className).toContain("p-10");
  });
});
