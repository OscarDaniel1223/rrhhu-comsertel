const express = require('express');

const router = express.Router();

// Importar los controladores

const {articulosGet} = require('../controllers/articulosController'); 
const {articulosPost} = require('../controllers/articulosController');
const {articulosUpdate} = require('../controllers/articulosController');
const {articulosDelete} = require('../controllers/articulosController');


//Deinir las rutas para los artículos
router.get('/articulos', articulosGet);
router.post('/articulosPost', articulosPost);
router.put('/articulosUpdate/:id_articulo', articulosUpdate);
router.delete('/articulosDelete/:id_articulo', articulosDelete);



// Exportar el router
module.exports = router;