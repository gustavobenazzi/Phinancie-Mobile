import { Router } from 'express';
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/category.controller.js';
import { auth } from "../middlewares/auth.js";

const router = Router();

router.post('/', auth, createCategory);
router.get('/', auth, getAllCategories);
router.get('/:id', auth, getCategoryById);
router.put('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

export default router;