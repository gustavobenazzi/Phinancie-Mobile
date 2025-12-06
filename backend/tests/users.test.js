import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { prismaMock } from "./utils/prismaMock.js";

jest.unstable_mockModule("../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

const { app } = await import("../src/app.js");

const signToken = (userId = "user-test") =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

afterEach(() => {
  jest.restoreAllMocks();
});

describe("POST /users", () => {
  it("cria usuário quando payload é válido e email é único", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const created = {
      id: "user-1",
      name: "Tester",
      email: "tester@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
    };
    prismaMock.user.create.mockResolvedValue(created);

    const response = await request(app)
      .post("/users")
      .send({ name: "Tester", email: "tester@example.com", password: "SenhaForte123" })
      .expect(201);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: "tester@example.com" } });
    expect(response.body).toEqual({ data: created });
  });

  it("retorna 409 quando email já está cadastrado", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "user-existing" });

    const response = await request(app)
      .post("/users")
      .send({ name: "Tester", email: "tester@example.com", password: "SenhaForte123" })
      .expect(409);

    expect(response.body).toEqual({ error: "email já cadastrado" });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});

describe("GET /users/profile", () => {
  it("retorna dados do usuário autenticado", async () => {
    const token = signToken("user-1");
    const profile = {
      id: "user-1",
      name: "Profile",
      email: "profile@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-02T00:00:00.000Z",
    };
    prismaMock.user.findFirst.mockResolvedValue(profile);

    const response = await request(app)
      .get("/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { id: "user-1", isActive: true },
      select: expect.any(Object),
    });
    expect(response.body).toEqual({ data: profile });
  });
});

describe("PUT /users/:id", () => {
  it("atualiza todos os campos quando usuário é o dono", async () => {
    const token = signToken("user-1");
    prismaMock.user.findFirst.mockResolvedValue(null); // verificação de email duplicado
    const updated = {
      id: "user-1",
      name: "Novo Nome",
      email: "novo@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-02-01T00:00:00.000Z",
    };
    prismaMock.user.update.mockResolvedValue(updated);

    const response = await request(app)
      .put("/users/user-1")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Novo Nome", email: "novo@example.com", password: "SenhaForte123" })
      .expect(200);

    const updateCall = prismaMock.user.update.mock.calls[0][0];
    expect(updateCall.where).toEqual({ id: "user-1" });
    expect(updateCall.data).toMatchObject({ name: "Novo Nome", email: "novo@example.com" });
    expect(updateCall.data.passwordHash).toEqual(expect.any(String));
    expect(response.body).toEqual({ data: updated });
  });

  it("retorna 403 quando usuário tenta atualizar outra conta", async () => {
    const token = signToken("user-1");

    await request(app)
      .put("/users/other-user")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Novo", email: "novo@example.com" })
      .expect(403);

    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("retorna 409 quando email já pertence a outro usuário", async () => {
    const token = signToken("user-1");
    prismaMock.user.findFirst.mockResolvedValue({ id: "someone-else" });

    const response = await request(app)
      .put("/users/user-1")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Novo", email: "duplicado@example.com" })
      .expect(409);

    expect(response.body).toEqual({ error: "email já cadastrado" });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});

describe("PATCH /users/:id", () => {
  it("atualiza parcialmente quando apenas nome é informado", async () => {
    const token = signToken("user-1");
    const updated = {
      id: "user-1",
      name: "Nome Parcial",
      email: "tester@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-02-01T00:00:00.000Z",
    };
    prismaMock.user.update.mockResolvedValue(updated);

    const response = await request(app)
      .patch("/users/user-1")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Nome Parcial" })
      .expect(200);

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "Nome Parcial" },
      select: expect.any(Object),
    });
    expect(response.body).toEqual({ data: updated });
  });
});
