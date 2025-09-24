import { prisma } from "../lib/prisma.js";

export async function createCategory(req, res) {
  try {
    const { name, type, icon, userId } = req.body;

    if (!userId || !name || !type || !icon) {
      return res
        .status(400)
        .json({ error: "userId, nome, tipo e ícone são obrigatórios" });
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (existingCategory) {
      return res
        .status(409)
        .json({ error: "Você já possui uma categoria com este nome" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        icon,
        userId, 
      },
    });

    return res.status(201).json({ data: category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao criar categoria" });
  }
}

export async function getAllCategories(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "O 'userId' é obrigatório nos query parameters." });
    }

    const categories = await prisma.category.findMany({
      where: { userId: userId },
      orderBy: { name: "asc" },
    });

    return res.json({ data: categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao buscar categorias" });
  }
}

export async function getCategoryById(req, res) {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id: id },
    });

    if (!category) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }
    return res.json({ data: category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao buscar categoria" });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, type, icon } = req.body;

    const updatedCategory = await prisma.category.update({
      where: { id: id },
      data: { name, type, icon },
    });

    return res.json({ data: updatedCategory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao atualizar categoria" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id: id },
    });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno ao deletar categoria" });
  }
}