import request from "supertest";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { prismaMock } from "./utils/prismaMock.js";

jest.unstable_mockModule("../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

const { app } = await import("../src/app.js");

afterEach(() => {
  jest.restoreAllMocks();
});

describe("POST /auth/login", () => {
  it("retorna token e dados do usuário para credenciais válidas", async () => {
    const passwordHash = await bcrypt.hash("SenhaForte123", 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Tester",
      email: "tester@example.com",
      passwordHash,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "tester@example.com", password: "SenhaForte123" })
      .expect(200);

    expect(response.body?.data?.token).toBeDefined();
    expect(response.body?.data?.user).toMatchObject({
      id: "user-1",
      name: "Tester",
      email: "tester@example.com",
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: "tester@example.com" } });
  });

  it("retorna 401 quando a senha está incorreta", async () => {
    const passwordHash = await bcrypt.hash("SenhaCorreta", 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: "user-1",
      name: "Tester",
      email: "tester@example.com",
      passwordHash,
    });

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "tester@example.com", password: "Errada" })
      .expect(401);

    expect(response.body).toEqual({ error: "credenciais inválidas" });
  });

  it("retorna 400 quando email ou senha não são enviados", async () => {
    const response = await request(app).post("/auth/login").send({ email: "a" }).expect(400);
    expect(response.body).toEqual({ error: "email e password são obrigatórios" });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});

describe("POST /auth/forgot", () => {
  it("gera token de reset para usuários existentes", async () => {
    const fakeBuffer = Buffer.alloc(32, 0xab);
    const expectedToken = fakeBuffer.toString("hex");
    jest.spyOn(crypto, "randomBytes").mockReturnValue(fakeBuffer);
    prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" });
    prismaMock.passwordResetToken.create.mockResolvedValue({});

    const response = await request(app)
      .post("/auth/forgot")
      .send({ email: "tester@example.com" })
      .expect(200);

    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ token: expectedToken, userId: "user-1" }),
    });
    expect(response.body.data).toMatchObject({
      message: "token de reset gerado",
      token: expectedToken,
      expiresAt: expect.any(String),
    });
  });

  it("retorna 404 quando usuário não existe", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post("/auth/forgot")
      .send({ email: "ghost@example.com" })
      .expect(404);

    expect(response.body).toEqual({ error: "usuário não encontrado" });
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
  });
});

describe("POST /auth/reset", () => {
  it("atualiza senha quando token é válido", async () => {
    const tokenRecord = {
      token: "reset-token",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60000),
      usedAt: null,
    };
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(tokenRecord);
    prismaMock.user.update.mockResolvedValue({ id: "user-1" });
    prismaMock.passwordResetToken.update.mockResolvedValue({ ...tokenRecord, usedAt: new Date() });

    const response = await request(app)
      .post("/auth/reset")
      .send({ token: "reset-token", newPassword: "NovaSenha123" })
      .expect(200);

    expect(prismaMock.passwordResetToken.findUnique).toHaveBeenCalledWith({ where: { token: "reset-token" } });
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(response.body).toEqual({ data: { message: "senha atualizada com sucesso" } });
  });

  it("retorna 400 quando token está expirado", async () => {
    const tokenRecord = {
      token: "reset-token",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
    };
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(tokenRecord);

    const response = await request(app)
      .post("/auth/reset")
      .send({ token: "reset-token", newPassword: "NovaSenha123" })
      .expect(400);

    expect(response.body).toEqual({ error: "token expirado" });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
