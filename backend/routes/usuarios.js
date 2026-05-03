const express = require('express');

const router = express.Router();


const { getUsuarios } = require('../controllers/usuariosController');
const { getRoles } = require('../controllers/usuariosController');
const { newUser } = require('../controllers/usuariosController');
const { updateUser } = require('../controllers/usuariosController');
const { deleteUser } = require('../controllers/usuariosController');
const { getUsuarioById } = require('../controllers/usuariosController');
const { activarUsuario } = require('../controllers/usuariosController');
router.get('/getUsuarios', getUsuarios);
router.get('/getRoles', getRoles);
router.post('/newUser', newUser);
router.post('/updateUser', updateUser);
router.post('/deleteUser', deleteUser);
router.get('/getUser', getUsuarioById);
router.post('/activarUsuario', activarUsuario);
module.exports = router;
