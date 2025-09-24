import express from "express";
import usersRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";
import transactionsRouter from "./routes/transactions.routes.js";

export const app = express();
app.use(express.json());

app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/transacao", transactionsRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.json({ message: "API is running" }));
