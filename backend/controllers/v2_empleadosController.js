const db = require('../config/db');

exports.getEmpleados = async (req, res) => {
    try {
        const query = `
            SELECT e.id, e.dui, e.nit, e.nombres, e.apellidos, e.fecha_ingreso, e.id_cargo, e.estado, e.creado_en,
                   c.titulo AS cargo, c.salario_base, d.nombre AS departamento
            FROM empleados e
            LEFT JOIN cargos c ON e.id_cargo = c.id
            LEFT JOIN rh_departamentos d ON c.id_departamento = d.id
        `;
        const [rows] = await db.query(query);
        res.json({
            status: 'success',
            data: rows,
            message: 'Empleados obtenidos exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener los empleados'
        });
    }
};

exports.getEmpleadoById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT e.id, e.dui, e.nit, e.nombres, e.apellidos, e.fecha_ingreso, e.id_cargo, e.estado, e.creado_en,
                   c.titulo AS cargo, c.salario_base, d.nombre AS departamento
            FROM empleados e
            LEFT JOIN cargos c ON e.id_cargo = c.id
            LEFT JOIN rh_departamentos d ON c.id_departamento = d.id
            WHERE e.id = ?
        `;
        const [rows] = await db.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Empleado no encontrado'
            });
        }
        res.json({
            status: 'success',
            data: rows[0],
            message: 'Empleado obtenido exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener el empleado'
        });
    }
};

exports.createEmpleado = async (req, res) => {
    try {
        const { dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado } = req.body;
        
        if (!dui || !nit || !nombres || !apellidos || !fecha_ingreso || !id_cargo) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Faltan campos obligatorios'
            });
        }
        
        // Validación de Formato Salvadoreño
        const duiRegex = /^\d{8}-\d{1}$/;
        const nitRegex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;

        if (!duiRegex.test(dui)) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'El DUI no tiene un formato válido (Ej. 12345678-9)'
            });
        }

        if (!nitRegex.test(nit)) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'El NIT no tiene un formato válido (Ej. 0614-010190-101-1)'
            });
        }

        const estadoFinal = estado || 'ACTIVO';

        const [result] = await db.query(
            'INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estadoFinal]
        );
        res.status(201).json({
            status: 'success',
            data: { id: result.insertId },
            message: 'Empleado creado exitosamente'
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                status: 'error',
                error: 'DUPLICATE_ENTRY',
                message: 'El DUI o NIT ya se encuentra registrado'
            });
        }
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al crear el empleado'
        });
    }
};

exports.updateEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado } = req.body;
        
        if (!dui || !nit || !nombres || !apellidos || !fecha_ingreso || !id_cargo || !estado) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Todos los campos son obligatorios para actualizar'
            });
        }
        
        // Validación de Formato Salvadoreño
        const duiRegex = /^\d{8}-\d{1}$/;
        const nitRegex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;

        if (!duiRegex.test(dui)) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'El DUI no tiene un formato válido (Ej. 12345678-9)'
            });
        }

        if (!nitRegex.test(nit)) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'El NIT no tiene un formato válido (Ej. 0614-010190-101-1)'
            });
        }
        
        const [result] = await db.query(
            'UPDATE empleados SET dui = ?, nit = ?, nombres = ?, apellidos = ?, fecha_ingreso = ?, id_cargo = ?, estado = ? WHERE id = ?',
            [dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Empleado no encontrado'
            });
        }
        res.json({
            status: 'success',
            data: { id },
            message: 'Empleado actualizado exitosamente'
        });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                status: 'error',
                error: 'DUPLICATE_ENTRY',
                message: 'El DUI o NIT ya se encuentra registrado por otro empleado'
            });
        }
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al actualizar el empleado'
        });
    }
};

exports.deleteEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("UPDATE empleados SET estado = 'INACTIVO' WHERE id = ?", [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Empleado no encontrado'
            });
        }
        res.json({
            status: 'success',
            data: { id },
            message: 'Empleado dado de baja exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'FOREIGN_KEY_CONSTRAINT_FAILS',
            message: 'Error al eliminar el empleado, podría tener registros asociados (ausencias, planillas)'
        });
    }
};
