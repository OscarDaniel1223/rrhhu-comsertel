const express = require('express');
const router = express.Router();

const {
    getAusenciasIncapacidades,
    getAusenciaIncapacidadById,
    createAusenciaIncapacidad,
    updateAusenciaIncapacidad,
    deleteAusenciaIncapacidad
} = require('../controllers/v2_ausenciasIncapacidadesController');

router.get('/ausencias-incapacidades', getAusenciasIncapacidades);
router.get('/ausencias-incapacidades/:id', getAusenciaIncapacidadById);
router.post('/ausencias-incapacidades', createAusenciaIncapacidad);
router.put('/ausencias-incapacidades/:id', updateAusenciaIncapacidad);
router.delete('/ausencias-incapacidades/:id', deleteAusenciaIncapacidad);

module.exports = router;
