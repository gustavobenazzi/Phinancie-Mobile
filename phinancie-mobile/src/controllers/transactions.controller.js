import { prisma } from "../lib/prisma.js";

export async function createTransaction(req, res) {
  try {
    const { userId, amount, type, description } = req.body;

    if (!userId || amount === undefined || !type) {
      return res.status(400).json({ error: "userId, amount e type são obrigatórios" });
    }

    if (!["credit", "debit"].includes(type)) {
      return res.status(400).json({ error: "type deve ser 'credit' ou 'debit'" });
    }

    const transaction = await prisma.transaction.create({
      data: { userId, amount, type, description },
    });

    return res.status(201).json({ data: transaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function getTransactionById(req, res) {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) return res.status(404).json({ error: "transação não encontrada" });
    return res.json({ data: transaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function listTransactions(req, res) {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const userId = req.query.userId;

    const where = userId ? { userId } : {};

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.json({
      data: items,
      meta: { page, limit, total },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { amount, type, description } = req.body;

    if (type !== undefined && !["credit", "debit"].includes(type)) {
      return res.status(400).json({ error: "type deve ser 'credit' ou 'debit'" });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { ...(amount !== undefined ? { amount } : {}), ...(type ? { type } : {}), ...(description ? { description } : {}) },
    });

    return res.json({ data: transaction });
  } catch (err) {
    if (err?.code === "P2025") return res.status(404).json({ error: "transação não encontrada" });
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;

    await prisma.transaction.delete({
      where: { id },
    });

    return res.json({ data: { id } });
  } catch (err) {
    if (err?.code === "P2025") return res.status(404).json({ error: "transação não encontrada" });
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}
