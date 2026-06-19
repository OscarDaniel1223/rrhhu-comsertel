const db = require('../config/db');

exports.getCargos = async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.titulo, c.salario_base, c.id_departamento, d.nombre as departamento
            FROM cargos c
            LEFT JOIN rh_departamentos d ON c.id_departamento = d.id
        `;
        const [rows] = await db.query(query);
        res.json({
            status: 'success',
            data: rows,
            message: 'Cargos obtenidos exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener los cargos'
        });
    }
};

exports.getCargoById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT c.id, c.titulo, c.salario_base, c.id_departamento, d.nombre as departamento
            FROM cargos c
            LEFT JOIN rh_departamentos d ON c.id_departamento = d.id
            WHERE c.id = ?
        `;
        const [rows] = await db.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Cargo no encontrado'
            });
        }
        res.json({
            status: 'success',
            data: rows[0],
            message: 'Cargo obtenido exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener el cargo'
        });
    }
};

exports.createCargo = async (req, res) => {
    try {
        const { titulo, salario_base, id_departamento } = req.body;
        
        if (!titulo || salario_base === undefined || !id_departamento) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Todos los campos son obligatorios'
            });
        }

        if (Number(salario_base) < 365.00) {
            return res.status(400).json({
                status: 'error',
                error: 'MINIMUM_WAGE_VIOLATION',
                message: 'El salario base no puede ser menor al salario mínimo legal de $365.00 USD'
            });
        }
        
        const [result] = await db.query(
            'INSERT INTO cargos (titulo, salario_base, id_departamento) VALUES (?, ?, ?)',
            [titulo, salario_base, id_departamento]
        );
        res.status(201).json({
            status: 'success',
            data: { id: result.insertId },
            message: 'Cargo creado exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al crear el cargo'
        });
    }
};

exports.updateCargo = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, salario_base, id_departamento } = req.body;
        
        if (!titulo || salario_base === undefined || !id_departamento) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Todos los campos son obligatorios'
            });
        }

        if (Number(salario_base) < 365.00) {
            return res.status(400).json({
                status: 'error',
                error: 'MINIMUM_WAGE_VIOLATION',
                message: 'El salario base no puede ser menor al salario mínimo legal de $365.00 USD'
            });
        }
        
        const [result] = await db.query(
            'UPDATE cargos SET titulo = ?, salario_base = ?, id_departamento = ? WHERE id = ?',
            [titulo, salario_base, id_departamento, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Cargo no encontrado'
            });
        }
        res.json({
            status: 'success',
            data: { id },
            message: 'Cargo actualizado exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al actualizar el cargo'
        });
    }
};

exports.deleteCargo = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM cargos WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Cargo no encontrado'
            });
        }
        res.json({
            status: 'success',
            data: { id },
            message: 'Cargo eliminado exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'FOREIGN_KEY_CONSTRAINT_FAILS',
            message: 'Error al eliminar el cargo, podría estar en uso por un empleado'
        });
    }
};
