import { Router } from 'express';
import { create, getAll, update, remove } from '../controllers/metas.controller.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

router.post('/', auth, create);
router.get('/', auth, getAll);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

export default router;
