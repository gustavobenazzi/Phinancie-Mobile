// src/routes/users.routes.js
import { Router } from "express";
import { createUser, getUserById, getMyProfile, updateUserPut, updateUserPatch, listUsers, deleteUser, } from "../controllers/users.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.get("/profile", auth, getMyProfile);
router.get("/", listUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", auth, updateUserPut);
router.patch("/:id", auth, updateUserPatch);
router.delete("/:id", auth, deleteUser);

export default router;