const express = require('express');
const router = express.Router();

const {
    getPlanillas,
    getPlanillaById,
    generarPlanilla,
    cerrarPlanilla,
    deletePlanilla
} = require('../controllers/v2_planillasController');

router.get('/planillas', getPlanillas);
router.get('/planillas/:id', getPlanillaById);
router.post('/planillas', generarPlanilla);
router.put('/planillas/:id/cerrar', cerrarPlanilla);
router.delete('/planillas/:id', deletePlanilla);

module.exports = router;
