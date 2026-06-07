const express = require('express');
const router = express.Router();

const {
    getDepartamentos,
    getDepartamentoById,
    createDepartamento,
    updateDepartamento,
    deleteDepartamento
} = require('../controllers/v2_departamentosController');

router.get('/departamentos', getDepartamentos);
router.get('/departamentos/:id', getDepartamentoById);
router.post('/departamentos', createDepartamento);
router.put('/departamentos/:id', updateDepartamento);
router.delete('/departamentos/:id', deleteDepartamento);

module.exports = router;
