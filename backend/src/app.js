import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.routes.js";
import authRouter from "./routes/auth.routes.js";
import transactionsRouter from "./routes/transactions.routes.js";
import metasRouter from "./routes/metas.routes.js";
import categoryRouter from "./routes/category.routes.js";
import statementsRouter from "./routes/statements.routes.js";

export const app = express();
app.use(cors());
app.use(express.json());

app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/transactions", transactionsRouter);
app.use("/goals", metasRouter);
app.use("/categories", categoryRouter);
app.use("/statements", statementsRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.json({ message: "Phinancie API is running" }));
