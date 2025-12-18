import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, it, expect, jest } from "@jest/globals";
import { prismaMock } from "./utils/prismaMock.js";

jest.unstable_mockModule("../src/lib/prisma.js", () => ({
  prisma: prismaMock,
}));

const { app } = await import("../src/app.js");

const signToken = (userId = "user-import") =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("/statements/import", () => {
  it("processa arquivos OFX válidos e retorna transações normalizadas", async () => {
    const token = signToken();
    const ofx = `OFXHEADER:100\nDATA:20240101\n<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST><STMTTRN>\n<TRNTYPE>DEBIT\n<DTPOSTED>20241101000000\n<TRNAMT>-50.25\n<NAME>Compra Mercado\n</STMTTRN></BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`;

    const response = await request(app)
      .post("/statements/import")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(ofx), {
        filename: "extrato.ofx",
        contentType: "application/x-ofx",
      })
      .expect(200);

    expect(response.body.meta).toMatchObject({ format: "ofx", profile: null, total: 1 });
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      amount: 50.25,
      type: "EXPENSE",
      description: "Compra Mercado",
      categoryName: expect.stringContaining("Despesas"),
    });
  });

  it("retorna 400 quando CSV não corresponde a nenhum perfil", async () => {
    const token = signToken();
    const csv = "Foo,Bar\n1,2";

    const response = await request(app)
      .post("/statements/import")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", Buffer.from(csv), {
        filename: "extrato.csv",
        contentType: "text/csv",
      })
      .expect(400);

    expect(response.body).toMatchObject({
      error: expect.stringContaining("perfil"),
      headers: ["Foo", "Bar"],
      profiles: expect.any(Array),
    });
  });
});
