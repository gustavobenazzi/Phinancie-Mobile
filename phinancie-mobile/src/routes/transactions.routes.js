import { Router } from "express";
import { createTransaction, getTransactionById, listTransactions, updateTransaction, deleteTransaction } from "../controllers/transactions.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.post("/", auth, createTransaction);
router.get("/", auth, listTransactions);
router.get("/:id", auth, getTransactionById);
router.put("/:id", auth, updateTransaction);
router.patch("/:id", auth, updateTransaction);
router.delete("/:id", auth, deleteTransaction);

export default router;

/* Exemplo de .env
DATABASE_URL="postgresql://user:senha@localhost:5432/postgres?schema=public"
JWT_SECRET="teste"
*/
