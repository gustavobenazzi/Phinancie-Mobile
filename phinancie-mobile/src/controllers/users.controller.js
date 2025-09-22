// src/controllers/users.controller.js
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

const isEmail = (s) => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isStrongPassword = (s) => typeof s === "string" && /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(s);

// ---------- CREATE ----------
export async function createUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email e password são obrigatórios" });
    }
    if (!isEmail(email)) return res.status(400).json({ error: "email inválido" });
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: "senha fraca (mínimo 8, 1 letra e 1 número)" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "email já cadastrado" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return res.status(201).json({ data: user });
  } catch (err) {
    if (err?.code === "P2002") return res.status(409).json({ error: "email já cadastrado" });
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
      where: { id, isActive: true }, // <--- só ativos
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });
    if (!user) return res.status(404).json({ error: "usuário não encontrado" });
    return res.json({ data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function getMyProfile(req, res) {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findFirst({
      where: { id: userId, isActive: true }, // <--- só ativos
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });
    if (!user) return res.status(404).json({ error: "usuário não encontrado" });
    return res.json({ data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function updateUserPut(req, res) {
  try {
    const { id } = req.params;
    if (req.user?.id !== id) return res.status(403).json({ error: "forbidden" });

    const { name, email, password } = req.body;
    if (!name || !email) return res.status(400).json({ error: "name e email são obrigatórios" });
    if (!isEmail(email)) return res.status(400).json({ error: "email inválido" });

    const other = await prisma.user.findFirst({ where: { email, NOT: { id } }, select: { id: true } });
    if (other) return res.status(409).json({ error: "email já cadastrado" });

    let passwordHash;
    if (password !== undefined) {
      if (!isStrongPassword(password)) return res.status(400).json({ error: "senha fraca (mínimo 8, 1 letra e 1 número)" });
      passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, ...(passwordHash ? { passwordHash } : {}) },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });
    return res.json({ data: user });
  } catch (err) {
    if (err?.code === "P2025") return res.status(404).json({ error: "usuário não encontrado" });
    if (err?.code === "P2002") return res.status(409).json({ error: "email já cadastrado" });
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function updateUserPatch(req, res) {
  try {
    const { id } = req.params;
    if (req.user?.id !== id) return res.status(403).json({ error: "forbidden" });

    const { name, email, password } = req.body;
    if (name === undefined && email === undefined && password === undefined) {
      return res.status(400).json({ error: "nenhum campo para atualizar" });
    }
    if (email !== undefined && !isEmail(email)) return res.status(400).json({ error: "email inválido" });

    if (email !== undefined) {
      const other = await prisma.user.findFirst({ where: { email, NOT: { id } }, select: { id: true } });
      if (other) return res.status(409).json({ error: "email já cadastrado" });
    }

    let passwordHash;
    if (password !== undefined) {
      if (!isStrongPassword(password)) return res.status(400).json({ error: "senha fraca (mínimo 8, 1 letra e 1 número)" });
      passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
      select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });
    return res.json({ data: user });
  } catch (err) {
    if (err?.code === "P2025") return res.status(404).json({ error: "usuário não encontrado" });
    if (err?.code === "P2002") return res.status(409).json({ error: "email já cadastrado" });
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function listUsers(req, res) {
  try {
    // opcional: paginação/busca simples
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const q = (req.query.q ?? "").toString();

    const where = q
      ? {
          OR: [
            { name:  { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, name: true, email: true, createdAt: true, updatedAt: true }, // sem passwordHash
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
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

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (req.user?.id !== id) {
      return res.status(403).json({ error: "forbidden" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true, updatedAt: true },
    });

    return res.json({ data: user });
  } catch (err) {
    if (err?.code === "P2025") {
      return res.status(404).json({ error: "usuário não encontrado" });
    }
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}
