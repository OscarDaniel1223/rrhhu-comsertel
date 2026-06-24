const express = require('express');
const router = express.Router();
const novedadesController = require('../controllers/v2_novedadesController');

// Rutas de novedades
router.get('/novedades', novedadesController.getNovedades);
router.post('/novedades', novedadesController.saveNovedades);

module.exports = router;
