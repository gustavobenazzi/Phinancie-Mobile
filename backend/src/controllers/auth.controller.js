import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "email e password são obrigatórios" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "credenciais inválidas" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "credenciais inválidas" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email é obrigatório" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "usuário não encontrado" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    return res.json({
      data: {
        message: "token de reset gerado",
        token,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ error: "token e newPassword são obrigatórios" });
    const strong = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword);
    if (!strong) return res.status(400).json({ error: "senha fraca (mínimo 8, 1 letra e 1 número)" });

    const prt = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!prt) return res.status(400).json({ error: "token inválido" });
    if (prt.usedAt) return res.status(400).json({ error: "token já utilizado" });
    if (prt.expiresAt < new Date()) return res.status(400).json({ error: "token expirado" });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: prt.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    return res.json({ data: { message: "senha atualizada com sucesso" } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "erro interno" });
  }
}