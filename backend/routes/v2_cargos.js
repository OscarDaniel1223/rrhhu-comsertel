const express = require('express');
const router = express.Router();

const {
    getCargos,
    getCargoById,
    createCargo,
    updateCargo,
    deleteCargo
} = require('../controllers/v2_cargosController');

router.get('/cargos', getCargos);
router.get('/cargos/:id', getCargoById);
router.post('/cargos', createCargo);
router.put('/cargos/:id', updateCargo);
router.delete('/cargos/:id', deleteCargo);

module.exports = router;
