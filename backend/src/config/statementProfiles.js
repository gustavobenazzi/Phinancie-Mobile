const normalizeKey = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]/g, "");

const normalizeText = (value = "") => value.toString().trim();

const containsAll = (headers, required = []) =>
  required.every((group) => !group?.length || group.some((option) => headers.includes(option)));

const parseLocalizedNumber = (raw = "") => {
  if (raw === null || raw === undefined) return null;
  const cleaned = raw.toString().replace(/[^0-9.,-]/g, "").trim();
  if (!cleaned) return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  let normalized = cleaned.replace(/\./g, "");
  if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
  }

  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const parseDateValue = (raw = "") => {
  if (!raw) return null;
  const trimmed = raw.toString().trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const date = new Date(trimmed);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  const digits = trimmed.replace(/[^0-9]/g, "");
  if (digits.length >= 8) {
    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    const year = Number(digits.slice(4, 8));
    if (day && month && year) {
      const date = new Date(year, month - 1, day, 12, 0, 0);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }

  return null;
};

const pickValue = (row, candidates = []) => {
  for (const candidate of candidates) {
    if (row[candidate]) {
      return row[candidate];
    }
  }
  return null;
};

const findHeaderByKeywords = (headers = [], keywords = []) =>
  headers.find((header) => keywords.some((keyword) => header.includes(keyword)));

const createCsvProfile = ({
  key,
  label,
  description,
  columnSets,
  debitKeywords = [],
  creditKeywords = [],
}) => {
  const normalizedColumnSets = Object.fromEntries(
    Object.entries(columnSets).map(([field, candidates]) => [
      field,
      candidates.map((candidate) => normalizeKey(candidate)),
    ]),
  );

  const supports = (headers = []) =>
    containsAll(headers, [
      normalizedColumnSets.date,
      normalizedColumnSets.description,
      normalizedColumnSets.amount,
    ]);

  const keywordMatches = (value = "", keywords = []) => {
    if (!value) return false;
    const normalized = normalizeKey(value);
    return keywords.some((keyword) => normalized.includes(keyword));
  };

  const parseRow = (row, index) => {
    const dateValue = pickValue(row, normalizedColumnSets.date);
    const descriptionValue = pickValue(row, normalizedColumnSets.description);
    const amountValue = pickValue(row, normalizedColumnSets.amount);

    const isoDate = parseDateValue(dateValue);
    const amount = parseLocalizedNumber(amountValue);

    if (!isoDate || amount === null) {
      return null;
    }

    let type = amount < 0 ? "EXPENSE" : "INCOME";
    const typeValue = pickValue(row, normalizedColumnSets.type || []);

    if (typeValue) {
      if (keywordMatches(typeValue, debitKeywords)) {
        type = "EXPENSE";
      } else if (keywordMatches(typeValue, creditKeywords)) {
        type = "INCOME";
      }
    }

    const absoluteAmount = Math.abs(amount);
    const description = normalizeText(descriptionValue) || "Transação importada";

    return {
      localId: `${key}-${Date.now()}-${index}`,
      amount: absoluteAmount,
      type,
      description,
      establishment: description,
      date: isoDate,
    };
  };

  return {
    key,
    label,
    description,
    format: "csv",
    supports,
    parseRow,
  };
};

const csvProfiles = [
  createCsvProfile({
    key: "generic-csv-ptbr",
    label: "Genérico CSV (Data;Descrição;Valor)",
    description: "Funciona com arquivos que possuam colunas Data, Descrição e Valor.",
    columnSets: {
      date: ["Data", "Data Lançamento", "Data Lancamento", "Dt", "Dia"],
      description: ["Descrição", "Descricao", "Histórico", "Historico", "Movimento", "Detalhes"],
      amount: ["Valor", "Valor (R$)", "Valor da Transação", "Valor Bruto"],
      type: ["Tipo", "Natureza", "Crédito/Débito", "Tipo Lançamento"],
    },
    debitKeywords: ["debito", "saida", "saída", "pagamento", "pixenviado", "transferencia enviada"],
    creditKeywords: ["credito", "entrada", "receb", "deposito", "pixrecebido", "transferencia recebida"],
  }),
  createCsvProfile({
    key: "banco-inter-csv-v1",
    label: "Banco Inter CSV (app)",
    description: "Exportação CSV do Banco Inter (Data;Descrição;Tipo;Valor).",
    columnSets: {
      date: ["Data"],
      description: ["Descrição", "Descricao"],
      amount: ["Valor", "Valor (R$)", "Valor Total"],
      type: ["Tipo", "Tipo de Transação"],
    },
    debitKeywords: ["debito", "pagamento", "pix enviado", "transferencia enviada"],
    creditKeywords: ["credito", "recebido", "pix recebido", "transferencia recebida"],
  }),
];

const AUTO_DEBIT_KEYWORDS = [
  "debito",
  "debitoautomatico",
  "pagamento",
  "saida",
  "saída",
  "transferenciaenviada",
  "pixenviado",
  "compra",
  "compraonline",
  "boleto",
  "cartao",
];

const AUTO_CREDIT_KEYWORDS = [
  "credito",
  "entrada",
  "receb",
  "deposito",
  "pixrecebido",
  "transferenciarecebida",
  "receita",
  "salario",
];

export const inferCsvProfile = (headers = []) => {
  if (!headers?.length) return null;

  const dateKey = findHeaderByKeywords(headers, ["data", "dt", "date", "dia", "lanc", "evento"]);
  const amountKey = findHeaderByKeywords(headers, [
    "valor",
    "amount",
    "total",
    "saldo",
    "credito",
    "debito",
    "entrada",
    "saida",
  ]);
  const descriptionKey =
    findHeaderByKeywords(headers, [
      "descricao",
      "descri",
      "historico",
      "hist",
      "detalhe",
      "movimento",
      "texto",
      "identific",
      "comprovante",
      "documento",
    ]) || headers.find((header) => header !== dateKey && header !== amountKey);
  const typeKey = findHeaderByKeywords(headers, ["tipo", "natureza", "dc", "sinal", "mov", "categoria"]);

  if (!dateKey || !amountKey) {
    return null;
  }

  return createCsvProfile({
    key: `auto-${dateKey}-${amountKey}`,
    label: "Detecção automática",
    description: "Gerado automaticamente a partir dos cabeçalhos enviados.",
    columnSets: {
      date: [dateKey],
      description: descriptionKey ? [descriptionKey] : ["descricao"],
      amount: [amountKey],
      type: typeKey ? [typeKey] : [],
    },
    debitKeywords: AUTO_DEBIT_KEYWORDS,
    creditKeywords: AUTO_CREDIT_KEYWORDS,
  });
};

export const STATEMENT_PROFILES = [...csvProfiles];

export const listProfileMetadata = () =>
  STATEMENT_PROFILES.map((profile) => ({
    key: profile.key,
    label: profile.label,
    description: profile.description,
    format: profile.format,
  }));

export const findProfileByKey = (key) => STATEMENT_PROFILES.find((profile) => profile.key === key);

export const detectCsvProfile = (headers = []) =>
  STATEMENT_PROFILES.find((profile) => profile.format === "csv" && profile.supports(headers));

export const normalizeCsvRow = (row = {}) => {
  const normalized = {};
  Object.entries(row).forEach(([rawKey, value]) => {
    const key = normalizeKey(rawKey);
    normalized[key] = value?.toString().trim() ?? "";
  });
  return normalized;
};

export const buildTransactionsFromCsv = (rows, profile) => {
  if (!profile) return [];
  return rows
    .map((row, index) => profile.parseRow(normalizeCsvRow(row), index))
    .filter(Boolean);
};

export const getCsvHeaders = (rows) => {
  if (!rows.length) return [];
  return Object.keys(rows[0]).map((header) => normalizeKey(header));
};
