import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, it, expect, jest } from "@jest/globals";
import { prismaMock } from "./utils/prismaMock.js";

jest.unstable_mockModule("../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

const { app } = await import("../src/app.js");

const signToken = (userId = "user-test") =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("/transactions endpoints", () => {
  it("cria transação quando payload é válido e categoria pertence ao usuário", async () => {
    const token = signToken("user-123");
    prismaMock.category.findFirst.mockResolvedValue({ id: "cat-1", userId: "user-123" });
    const created = {
      id: "tx-1",
      userId: "user-123",
      amount: 150,
      type: "INCOME",
      categoryId: "cat-1",
      description: "Bonus",
      establishment: null,
      date: "2024-02-01T00:00:00.000Z",
      createdAt: "2024-02-01T00:00:00.000Z",
      updatedAt: "2024-02-01T00:00:00.000Z",
    };
    prismaMock.transaction.create.mockResolvedValue(created);

    const response = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 150, type: "INCOME", categoryId: "cat-1", description: "Bonus" })
      .expect(201);

    expect(response.body).toEqual({ data: created });
    expect(prismaMock.category.findFirst).toHaveBeenCalledWith({ where: { id: "cat-1", userId: "user-123" } });
    expect(prismaMock.transaction.create).toHaveBeenCalled();
  });

  it("retorna 400 quando a categoria não pertence ao usuário", async () => {
    const token = signToken("user-123");
    prismaMock.category.findFirst.mockResolvedValue(null);

    const response = await request(app)
      .post("/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 50, type: "EXPENSE", categoryId: "cat-999" })
      .expect(400);

    expect(response.body).toEqual({ error: "categoria inválida ou não pertence ao usuário" });
    expect(prismaMock.transaction.create).not.toHaveBeenCalled();
  });

  it("lista transações respeitando paginação e filtros", async () => {
    const token = signToken("user-abc");
    const items = [
      {
        id: "tx-10",
        userId: "user-abc",
        amount: 80,
        type: "EXPENSE",
        categoryId: "cat-1",
        description: "Mercado",
        createdAt: "2024-03-01T00:00:00.000Z",
        updatedAt: "2024-03-01T00:00:00.000Z",
        category: { id: "cat-1", name: "Mercado" },
      },
    ];
    prismaMock.transaction.findMany.mockResolvedValue(items);
    prismaMock.transaction.count.mockResolvedValue(5);

    const response = await request(app)
      .get("/transactions?page=2&limit=1&userId=user-abc")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({ data: items, meta: { page: 2, limit: 1, total: 5 } });
    expect(prismaMock.transaction.findMany).toHaveBeenCalledWith({
      where: { userId: "user-abc" },
      skip: 1,
      take: 1,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
  });

  it("deleta transação existente e retorna id", async () => {
    const token = signToken("user-del");
    prismaMock.transaction.delete.mockResolvedValue({ id: "tx-9" });

    const response = await request(app)
      .delete("/transactions/tx-9")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(prismaMock.transaction.delete).toHaveBeenCalledWith({ where: { id: "tx-9" } });
    expect(response.body).toEqual({ data: { id: "tx-9" } });
  });

  it("retorna 404 ao tentar deletar transação inexistente", async () => {
    const token = signToken("user-del");
    prismaMock.transaction.delete.mockRejectedValue({ code: "P2025" });

    const response = await request(app)
      .delete("/transactions/unknown")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(response.body).toEqual({ error: "transação não encontrada" });
  });
});
