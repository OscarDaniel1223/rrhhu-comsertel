const express = require('express');
const router = express.Router();

const {
    getEmpleados,
    getEmpleadoById,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado
} = require('../controllers/v2_empleadosController');

router.get('/empleados', getEmpleados);
router.get('/empleados/:id', getEmpleadoById);
router.post('/empleados', createEmpleado);
router.put('/empleados/:id', updateEmpleado);
router.delete('/empleados/:id', deleteEmpleado);

module.exports = router;
