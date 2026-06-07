const db = require('../config/db');

exports.getDepartamentos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM rh_departamentos');
        res.json({
            status: 'success',
            data: rows,
            message: 'Departamentos obtenidos exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener los departamentos'
        });
    }
};

exports.getDepartamentoById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM rh_departamentos WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Departamento no encontrado'
            });
        }
        res.json({
            status: 'success',
            data: rows[0],
            message: 'Departamento obtenido exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener el departamento'
        });
    }
};

exports.createDepartamento = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        if (!nombre) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'El nombre es obligatorio'
            });
        }
        
        const [result] = await db.query('INSERT INTO rh_departamentos (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion || null]);
        res.status(201).json({
            status: 'success',
            data: { id: result.insertId },
            message: 'Departamento creado exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al crear el departamento'
        });
    }
};

exports.updateDepartamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;
        
        if (!nombre) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'El nombre es obligatorio'
            });
        }
        
        const [result] = await db.query('UPDATE rh_departamentos SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion || null, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Departamento no encontrado'
            });
        }
        
        res.json({
            status: 'success',
            data: { id },
            message: 'Departamento actualizado exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al actualizar el departamento'
        });
    }
};

exports.deleteDepartamento = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM rh_departamentos WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Departamento no encontrado'
            });
        }
        
        res.json({
            status: 'success',
            data: { id },
            message: 'Departamento eliminado exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'FOREIGN_KEY_CONSTRAINT_FAILS',
            message: 'Error al eliminar el departamento, podría estar en uso por un cargo'
        });
    }
};
