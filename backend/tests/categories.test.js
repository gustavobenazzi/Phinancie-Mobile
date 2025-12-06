import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, it, expect, jest } from "@jest/globals";
import { prismaMock } from "./utils/prismaMock.js";

jest.unstable_mockModule("../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

const { app } = await import("../src/app.js");

const signToken = (userId = "user-cat") =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("/categories endpoints", () => {
  it("cria categoria quando não existe duplicidade", async () => {
    const token = signToken("user-cat");
    prismaMock.category.findFirst.mockResolvedValue(null);
    const created = { id: "cat-1", name: "Mercado", type: "EXPENSE", icon: "Bag", userId: "user-cat" };
    prismaMock.category.create.mockResolvedValue(created);

    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Mercado", type: "EXPENSE", icon: "Bag" })
      .expect(201);

    expect(prismaMock.category.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ name: "Mercado", userId: "user-cat" }),
    });
    expect(response.body).toEqual({ data: created });
  });

  it("impede duplicidade de nome por usuário", async () => {
    const token = signToken("user-cat");
    prismaMock.category.findFirst.mockResolvedValue({ id: "cat-1" });

    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Mercado", type: "EXPENSE", icon: "Bag" })
      .expect(409);

    expect(response.body).toEqual({ error: "Você já possui uma categoria com este nome" });
    expect(prismaMock.category.create).not.toHaveBeenCalled();
  });

  it("lista categorias ordenadas apenas do usuário autenticado", async () => {
    const token = signToken("user-cat");
    const categories = [
      { id: "cat-1", name: "Farmácia", type: "EXPENSE", icon: "Pharmacy" },
      { id: "cat-2", name: "Salário", type: "INCOME", icon: "Money" },
    ];
    prismaMock.category.findMany.mockResolvedValue(categories);

    const response = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(prismaMock.category.findMany).toHaveBeenCalledWith({ where: { userId: "user-cat" }, orderBy: { name: "asc" } });
    expect(response.body).toEqual({ data: categories });
  });

  it("remove todas as categorias do usuário", async () => {
    const token = signToken("user-cat");
    prismaMock.category.deleteMany.mockResolvedValue({ count: 3 });

    const response = await request(app)
      .delete("/categories")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(prismaMock.category.deleteMany).toHaveBeenCalledWith({ where: { userId: "user-cat" } });
    expect(response.body).toEqual({ data: { deleted: 3 } });
  });

  it("deleta categoria específica e retorna 204", async () => {
    const token = signToken("user-cat");
    prismaMock.category.delete.mockResolvedValue({});

    await request(app)
      .delete("/categories/cat-123")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(prismaMock.category.delete).toHaveBeenCalledWith({ where: { id: "cat-123" } });
  });
});
