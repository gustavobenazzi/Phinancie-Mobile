import { prisma } from "../lib/prisma.js"; 

export async function create(req, res) {
  try {
    const { title, value, endDate } = req.body;
    const userId = req.user.id;

    if (!title || !value || !endDate) {
      return res.status(400).json({ error: "Título, valor e data final são obrigatórios" });
    }

    const goal = await prisma.financialGoal.create({
      data: {
        title,
        value,
        endDate: new Date(endDate),
        userId,
      },
    });

    return res.status(201).json({ data: goal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao criar meta" });
  }
}

export async function getAll(req, res) {
  try {
    const userId = req.user.id;

    const goals = await prisma.financialGoal.findMany({
      where: { userId: userId },
      orderBy: { endDate: 'asc' },
    });

    return res.json({ data: goals });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao buscar metas" });
  }
}

export async function update(req, res) {
  try {
    const { id } = req.params;
    const { title, value, endDate } = req.body;
    const userId = req.user.id;

    const goalExists = await prisma.financialGoal.findFirst({
      where: { id: id, userId: userId },
    });

    if (!goalExists) {
      return res.status(404).json({ error: "Meta não encontrada" });
    }

    const updatedGoal = await prisma.financialGoal.update({
      where: { id: id },
      data: { title, value, endDate: new Date(endDate) },
    });

    return res.json({ data: updatedGoal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao atualizar meta" });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const goalExists = await prisma.financialGoal.findFirst({
      where: { id: id, userId: userId },
    });

    if (!goalExists) {
      return res.status(404).json({ error: "Meta não encontrada" });
    }

    await prisma.financialGoal.delete({
      where: { id: id },
    });

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao deletar meta" });
  }
}
