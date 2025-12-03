import { Router } from "express";
import {
	createTransaction,
	getTransactionById,
	listTransactions,
	updateTransaction,
	deleteTransaction,
	deleteAllTransactions,
} from "../controllers/transactions.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.post("/", auth, createTransaction);
router.get("/", auth, listTransactions);
router.get("/:id", auth, getTransactionById);
router.put("/:id", auth, updateTransaction);
router.patch("/:id", auth, updateTransaction);
router.delete("/", auth, deleteAllTransactions);
router.delete("/:id", auth, deleteTransaction);

export default router;
