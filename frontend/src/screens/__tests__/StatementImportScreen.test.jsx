import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import StatementImportScreen from "../StatementImportScreen.jsx";
import api from "../../services/api";
import * as DocumentPicker from "expo-document-picker";

jest.mock("../../services/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

const sampleFile = {
  name: "extrato.ofx",
  mimeType: "application/x-ofx",
  uri: "file://extrato.ofx",
};

const sampleTransactions = [
  {
    localId: "tx-1",
    description: "Compra padaria",
    amount: -120.5,
    type: "EXPENSE",
    categoryName: "Alimentação",
    date: "2024-01-01T12:00:00.000Z",
  },
  {
    localId: "tx-2",
    description: "Salário",
    amount: 2500,
    type: "INCOME",
    categoryName: "Salário",
    date: "2024-01-05T12:00:00.000Z",
  },
];

if (!global.FormData) {
  global.FormData = class {
    constructor() {
      this.fields = [];
    }
    append(key, value) {
      this.fields.push([key, value]);
    }
  };
}

const selectMockFile = async (utils) => {
  await waitFor(() => expect(api.get).toHaveBeenCalled());
  DocumentPicker.getDocumentAsync.mockResolvedValueOnce({ canceled: false, assets: [sampleFile] });
  fireEvent.press(utils.getByText("Selecionar arquivo OFX"));
  await waitFor(() => expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled());
  await waitFor(() => expect(utils.getByText(sampleFile.name)).toBeTruthy());
};

describe("StatementImportScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { data: [] } });
  });

  it("seleciona arquivo com sucesso e exibe detalhes", async () => {
    const utils = render(<StatementImportScreen />);

    await selectMockFile(utils);

    expect(utils.getByText("Arquivo pronto para análise")).toBeTruthy();
  });

  it("analisa arquivo e exibe transações retornadas", async () => {
    const utils = render(<StatementImportScreen />);

    await selectMockFile(utils);

    api.post.mockImplementation((endpoint) => {
      if (endpoint === "/statements/import") {
        return Promise.resolve({ data: { data: sampleTransactions } });
      }
      return Promise.resolve({});
    });

    fireEvent.press(utils.getByText("Enviar para análise"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/statements/import",
        expect.any(FormData),
        expect.objectContaining({ headers: expect.any(Object) })
      );
      expect(utils.getByText("Compra padaria")).toBeTruthy();
      expect(utils.getByText("-R$120.50")).toBeTruthy();
      expect(utils.getByText("R$2500.00")).toBeTruthy();
      expect(utils.getByText("Salvar 2 transações")).toBeTruthy();
    });

    fireEvent.press(utils.getByText("Compra padaria"));
    await waitFor(() => {
      expect(utils.getByText("Salvar 1 transações")).toBeTruthy();
    });
  });

  it("salva transações importadas criando categorias quando necessário", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const savedTransactions = [];

    api.post.mockImplementation((endpoint, payload) => {
      if (endpoint === "/statements/import") {
        return Promise.resolve({ data: { data: sampleTransactions } });
      }
      if (endpoint === "/categories") {
        return Promise.resolve({ data: { data: { id: `${payload.name}-id` } } });
      }
      if (endpoint === "/transactions") {
        savedTransactions.push(payload);
        return Promise.resolve({});
      }
      return Promise.resolve({});
    });

    const utils = render(<StatementImportScreen />);

    await selectMockFile(utils);

    fireEvent.press(utils.getByText("Enviar para análise"));

    await waitFor(() => expect(utils.getByText("Salvar 2 transações")).toBeTruthy());

    fireEvent.press(utils.getByText("Salvar 2 transações"));

    await waitFor(() => {
      expect(savedTransactions).toHaveLength(2);
      expect(savedTransactions[0]).toEqual(
        expect.objectContaining({
          categoryId: "Alimentação-id",
          type: "EXPENSE",
          amount: sampleTransactions[0].amount,
        })
      );
      expect(savedTransactions[1]).toEqual(
        expect.objectContaining({
          categoryId: "Salário-id",
          type: "INCOME",
        })
      );
      expect(alertSpy).toHaveBeenCalledWith("Sucesso", "2 transações importadas.");
      expect(mockGoBack).toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });
});
