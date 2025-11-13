import { Router } from "express";
import { login, requestPasswordReset, resetPassword } from "../controllers/auth.controller.js";

const router = Router();
router.post("/login", login);
router.post("/forgot", requestPasswordReset); 
router.post("/reset", resetPassword);         

export default router;
