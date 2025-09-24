const express = require('express');
const router = express.Router();
const metasController = require('../controllers/metasController');

router.get('/', metasController.getAll);
router.post('/', metasController.create);
router.put('/:id', metasController.update);
router.delete('/:id', metasController.remove);

module.exports = router;