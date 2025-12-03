import pdfParse from "pdf-parse";
import { XMLParser } from "fast-xml-parser";
import { parse as parseCsv } from "csv-parse/sync";
import {
  buildTransactionsFromCsv,
  detectCsvProfile,
  findProfileByKey,
  getCsvHeaders,
  inferCsvProfile,
  listProfileMetadata,
} from "../config/statementProfiles.js";

const LINE_REGEX = /(?<date>\d{2}\/\d{2}\/\d{4})\s+(?<amount>[-+]?\d[\d.,]*)\s+(?<description>.+)/;
const DEFAULT_INCOME_CATEGORY = "Receitas importadas";
const DEFAULT_EXPENSE_CATEGORY = "Despesas importadas";
const FILE_KINDS = Object.freeze({ PDF: "pdf", OFX: "ofx", CSV: "csv" });
const DEBIT_TYPES = new Set(["DEBIT", "PAYMENT", "WITHDRAWAL", "POS", "CHECK", "FEE", "SRVCHG", "DIRECTDEBIT", "REPEATPMT", "ACH", "XFER", "WITHDRW"]);

const xmlParser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  attributeNamePrefix: "",
});

const extractTextValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return value.toString();
  if (typeof value === "object") {
    for (const key of ["#text", "_text", "_", "text", "value"]) {
      if (typeof value[key] === "string") return value[key];
    }
    const firstString = Object.values(value).find((child) => typeof child === "string");
    if (typeof firstString === "string") return firstString;
  }
  return String(value ?? "");
};

const parseNumericValue = (value) => {
  const raw = extractTextValue(value).replace(/,/g, ".");
  if (!raw) return NaN;
  return Number(raw);
};

const sanitizeLine = (line = "") => line.replace(/\s+/g, " ").trim();
const sanitizeText = (value = "") => extractTextValue(value).replace(/\s+/g, " ").trim();

const toIsoDate = (value) => {
  if (!value) return null;
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day, 12, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const parseAmount = (raw) => {
  if (typeof raw !== "string") return null;
  const normalized = raw.replace(/\./g, "").replace(/,/g, ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const ensureArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const detectFileKind = (file) => {
  if (!file) return null;
  if (file.detectedType) return file.detectedType;
  const name = file.originalname?.toLowerCase() ?? "";
  const type = file.mimetype?.toLowerCase() ?? "";

  if (type === "application/pdf" || name.endsWith(".pdf")) return FILE_KINDS.PDF;
  if (name.endsWith(".ofx") || name.endsWith(".qfx") || type.includes("ofx") || type.includes("qfx")) {
    return FILE_KINDS.OFX;
  }
  if (name.endsWith(".csv") || type.includes("csv") || type.includes("excel") || type === "text/plain") {
    return FILE_KINDS.CSV;
  }
  return null;
};

const buildTransactionsFromPdf = (text) => {
  const lines = text.split(/\r?\n/).map(sanitizeLine).filter(Boolean);
  const chunks = [];
  let current = null;

  for (const line of lines) {
    const match = LINE_REGEX.exec(line);
    if (match) {
      if (current) chunks.push(current);
      current = {
        date: match.groups.date,
        amountText: match.groups.amount,
        description: match.groups.description,
        raw: line,
      };
    } else if (current) {
      current.description = `${current.description} ${line}`.trim();
      current.raw = `${current.raw}\n${line}`;
    }
  }

  if (current) chunks.push(current);

  return chunks
    .map((chunk, index) => {
      const amount = parseAmount(chunk.amountText);
      const isoDate = toIsoDate(chunk.date);
      if (amount === null || !isoDate) return null;

      const type = amount < 0 ? "EXPENSE" : "INCOME";
      const absoluteAmount = Math.abs(amount);
      const description = chunk.description || "Transação importada";

      return {
        localId: `${Date.now()}-${index}`,
        amount: absoluteAmount,
        type,
        description,
        establishment: description,
        categoryName: type === "INCOME" ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY,
        date: isoDate,
        rawLine: chunk.raw,
      };
    })
    .filter(Boolean);
};

const stripOfxHeader = (raw = "") => {
  const startIndex = raw.indexOf("<OFX");
  if (startIndex === -1) {
    throw new Error("OFX_TAG_NOT_FOUND");
  }
  return raw.slice(startIndex);
};

const sanitizeAmpersands = (raw = "") => raw.replace(/&(?!amp;|lt;|gt;|apos;|quot;)/g, "&amp;");

const closeOpenTags = (raw = "") => {
  const lines = raw.replace(/\r/g, "").split("\n");
  const output = [];

  for (let i = 0; i < lines.length; i += 1) {
    const originalLine = lines[i];
    if (!originalLine) continue;
    const line = originalLine.trim();
    if (!line) continue;
    if (!line.startsWith("<") || line.startsWith("</") || line.endsWith("/>")) {
      output.push(line);
      continue;
    }

    const tagMatch = line.match(/^<([A-Za-z0-9_.-]+)>(.*)$/);
    if (!tagMatch) {
      output.push(line);
      continue;
    }

    const [, tag, valuePart] = tagMatch;
    if (!valuePart || valuePart.includes("<")) {
      output.push(line);
      continue;
    }

    const nextLine = (lines[i + 1] || "").trim();
    const closesNextLine = nextLine === `</${tag}>`;
    const closesSameLine = valuePart.trim().endsWith(`</${tag}>`);

    if (closesSameLine || closesNextLine) {
      output.push(line);
      continue;
    }

    const sanitizedValue = valuePart.trim();
    output.push(`<${tag}>${sanitizedValue}</${tag}>`);
  }

  return output.join("\n");
};

const convertOfxToXml = (raw) => closeOpenTags(sanitizeAmpersands(stripOfxHeader(raw)));

const parseOfxDate = (value) => {
  const raw = extractTextValue(value);
  if (!raw) return null;
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?/);
  if (!match) return null;
  const [_, year, month, day, hour = "12", minute = "00", second = "00"] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
  );
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const normalizeOfxTransaction = (trn, index) => {
  if (!trn) return null;
  const amount = parseNumericValue(trn.TRNAMT ?? trn.trnamt);
  if (!Number.isFinite(amount)) return null;

  const trnType = sanitizeText(trn.TRNTYPE ?? trn.trntype ?? "").toUpperCase();
  const isoDate = parseOfxDate(trn.DTPOSTED ?? trn.DTORIG ?? trn.DTUSER ?? trn.DTAVAIL);
  if (!isoDate) return null;

  const isDebitByType = DEBIT_TYPES.has(trnType);
  let type = amount < 0 ? "EXPENSE" : "INCOME";
  if (isDebitByType) type = "EXPENSE";

  const normalizedAmount = Math.abs(amount);
  const description = sanitizeText(
    trn.NAME ?? trn.MEMO ?? trn.PAYEE ?? trn.CHECKNUM ?? trn.REFNUM ?? trn.FITID ?? "Transação importada"
  );
  const fitId = sanitizeText(trn.FITID ?? trn.fitid ?? "");
  const checkNum = sanitizeText(trn.CHECKNUM ?? trn.checknum ?? "");
  const refNum = sanitizeText(trn.REFNUM ?? trn.refnum ?? "");
  const localId = fitId || checkNum || refNum || `ofx-${Date.now()}-${index}`;

  return {
    localId,
    amount: normalizedAmount,
    type,
    description,
    establishment: description,
    categoryName: type === "INCOME" ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY,
    date: isoDate,
    rawLine: trn,
  };
};

const collectOfxTransactions = (payload) => {
  const root = payload?.OFX ?? payload?.ofx;
  if (!root) return [];
  const transactions = [];

  const bankResponses = ensureArray(root.BANKMSGSRSV1?.STMTTRNRS);
  bankResponses.forEach((response) => {
    const list = response?.STMTRS?.BANKTRANLIST;
    transactions.push(...ensureArray(list?.STMTTRN));
  });

  const creditResponses = ensureArray(root.CREDITCARDMSGSRSV1?.CCSTMTTRNRS);
  creditResponses.forEach((response) => {
    const list = response?.CCSTMTRS?.BANKTRANLIST;
    transactions.push(...ensureArray(list?.STMTTRN));
  });

  return transactions;
};

const parseOfxBuffer = (buffer) => {
  const raw = buffer.toString("utf8");
  const xmlPayload = convertOfxToXml(raw);
  const parsed = xmlParser.parse(xmlPayload);
  const transactions = collectOfxTransactions(parsed)
    .map((item, index) => normalizeOfxTransaction(item, index))
    .filter(Boolean);

  return transactions;
};

const parsePdfBuffer = async (buffer) => {
  const { text } = await pdfParse(buffer);
  return buildTransactionsFromPdf(text || "");
};

const bufferToText = (buffer) => {
  const utf8 = buffer.toString("utf8");
  return utf8.includes("�") ? buffer.toString("latin1") : utf8;
};

const guessDelimiter = (raw = "") => {
  const firstLine = raw.split(/\r?\n/).find((line) => line.trim().length) || ";";
  const delimiters = [";", ",", "\t", "|"];
  const scores = delimiters.map((delimiter) => ({
    delimiter,
    count: firstLine.split(delimiter).length,
  }));
  scores.sort((a, b) => b.count - a.count);
  return scores[0].delimiter;
};

const parseCsvBuffer = (buffer, profileKey) => {
  const raw = bufferToText(buffer);
  const delimiter = guessDelimiter(raw);

  let rows;
  try {
    rows = parseCsv(raw, {
      columns: true,
      skip_empty_lines: true,
      delimiter,
      relax_column_count: true,
      trim: true,
    });
  } catch (error) {
    throw new Error(`CSV_PARSE_ERROR:${error.message}`);
  }

  if (!rows.length) {
    return { transactions: [], profile: null, headers: [] };
  }

  const headers = getCsvHeaders(rows);
  const rawHeaders = Object.keys(rows[0] || {});
  let profile = profileKey ? findProfileByKey(profileKey) : detectCsvProfile(headers);

  if (!profile) {
    profile = inferCsvProfile(headers);
  }

  if (!profile) {
    const err = new Error("CSV_PROFILE_NOT_FOUND");
    err.headers = rawHeaders;
    throw err;
  }

  const transactions = buildTransactionsFromCsv(rows, profile).map((tx, index) => {
    if (!tx) return null;
    const categoryName = tx.type === "INCOME" ? DEFAULT_INCOME_CATEGORY : DEFAULT_EXPENSE_CATEGORY;
    return {
      ...tx,
      categoryName,
      rawLine: rows[index],
    };
  });

  return {
    transactions: transactions.filter(Boolean),
    profile,
    headers: rawHeaders,
  };
};

export async function importStatement(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "Envie um arquivo PDF, OFX ou CSV em 'file'." });
  }

  const fileKind = detectFileKind(req.file);

  if (!fileKind) {
    return res.status(400).json({ error: "Formato de arquivo não suportado." });
  }

  const profileKey = req.body?.profileKey || req.query?.profileKey;

  try {
    let payload;

    if (fileKind === FILE_KINDS.OFX) {
      const data = parseOfxBuffer(req.file.buffer);
      payload = { data, meta: { total: data.length, profile: null, format: FILE_KINDS.OFX } };
    } else if (fileKind === FILE_KINDS.CSV) {
      const { transactions, profile, headers } = parseCsvBuffer(req.file.buffer, profileKey);
      payload = {
        data: transactions,
        meta: {
          total: transactions.length,
          profile: profile?.key ?? null,
          format: FILE_KINDS.CSV,
          headers,
        },
      };
    } else {
      const data = await parsePdfBuffer(req.file.buffer);
      payload = { data, meta: { total: data.length, profile: null, format: FILE_KINDS.PDF } };
    }

    return res.json(payload);
  } catch (error) {
    console.error(`Erro ao processar ${fileKind.toUpperCase()}`, error);

    if (error.message === "CSV_PROFILE_NOT_FOUND") {
      return res.status(400).json({
        error: "Não encontramos um perfil compatível para este CSV.",
        headers: error.headers || [],
        profiles: listProfileMetadata(),
      });
    }

    if (error.message?.startsWith("CSV_PARSE_ERROR")) {
      return res.status(400).json({ error: "Não conseguimos ler o CSV enviado." });
    }

    return res.status(500).json({ error: "Não foi possível ler o arquivo enviado." });
  }
}

export function listStatementProfiles(_req, res) {
  return res.json({ data: listProfileMetadata() });
}
