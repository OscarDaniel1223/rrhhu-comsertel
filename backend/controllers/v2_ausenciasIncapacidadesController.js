const db = require('../config/db');

exports.getAusenciasIncapacidades = async (req, res) => {
    try {
        const { id_empleado } = req.query;
        let query = `
            SELECT ai.id, ai.id_empleado, ai.tipo, ai.fecha_inicio, ai.fecha_fin, ai.motivo, ai.estado,
                   e.nombres AS empleado_nombres, e.apellidos AS empleado_apellidos, e.dui AS empleado_dui
            FROM ausencias_incapacidades ai
            INNER JOIN empleados e ON ai.id_empleado = e.id
        `;
        const params = [];
        
        if (id_empleado) {
            query += ` WHERE ai.id_empleado = ?`;
            params.push(id_empleado);
        }
        
        query += ` ORDER BY ai.fecha_inicio DESC`;
        
        const [rows] = await db.query(query, params);
        
        res.json({
            status: 'success',
            data: rows,
            message: 'Ausencias e incapacidades obtenidas exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener las ausencias e incapacidades'
        });
    }
};

exports.getAusenciaIncapacidadById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT ai.id, ai.id_empleado, ai.tipo, ai.fecha_inicio, ai.fecha_fin, ai.motivo, ai.estado,
                   e.nombres AS empleado_nombres, e.apellidos AS empleado_apellidos, e.dui AS empleado_dui
            FROM ausencias_incapacidades ai
            INNER JOIN empleados e ON ai.id_empleado = e.id
            WHERE ai.id = ?
        `;
        const [rows] = await db.query(query, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Registro de ausencia o incapacidad no encontrado'
            });
        }
        
        res.json({
            status: 'success',
            data: rows[0],
            message: 'Ausencia o incapacidad obtenida exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener la ausencia o incapacidad'
        });
    }
};

exports.createAusenciaIncapacidad = async (req, res) => {
    try {
        const { id_empleado, tipo, fecha_inicio, fecha_fin, motivo, estado } = req.body;
        
        if (!id_empleado || !tipo || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Faltan campos obligatorios'
            });
        }
        
        const tiposPermitidos = ['AUSENCIA_INJUSTIFICADA', 'PERMISO_GOCE', 'INCAPACIDAD_ISSS'];
        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Tipo de ausencia no valido. Debe ser uno de: AUSENCIA_INJUSTIFICADA, PERMISO_GOCE, INCAPACIDAD_ISSS'
            });
        }
        
        const estadosPermitidos = ['APROBADA', 'RECHAZADA', 'PENDIENTE'];
        const estadoFinal = estado || 'PENDIENTE';
        if (!estadosPermitidos.includes(estadoFinal)) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Estado no valido. Debe ser uno de: APROBADA, RECHAZADA, PENDIENTE'
            });
        }
        
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Formatos de fecha no validos'
            });
        }
        if (inicio > fin) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
            });
        }
        
        const [empleadoRows] = await db.query('SELECT id FROM empleados WHERE id = ?', [id_empleado]);
        if (empleadoRows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'El empleado especificado no existe'
            });
        }
        
        const query = `
            INSERT INTO ausencias_incapacidades (id_empleado, tipo, fecha_inicio, fecha_fin, motivo, estado)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [id_empleado, tipo, fecha_inicio, fecha_fin, motivo || null, estadoFinal]);
        
        res.status(201).json({
            status: 'success',
            data: { id: result.insertId },
            message: 'Ausencia o incapacidad registrada exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al registrar la ausencia o incapacidad'
        });
    }
};

exports.updateAusenciaIncapacidad = async (req, res) => {
    try {
        const { id } = req.params;
        const { id_empleado, tipo, fecha_inicio, fecha_fin, motivo, estado } = req.body;
        
        if (!id_empleado || !tipo || !fecha_inicio || !fecha_fin || !estado) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Todos los campos son obligatorios para actualizar'
            });
        }
        
        const tiposPermitidos = ['AUSENCIA_INJUSTIFICADA', 'PERMISO_GOCE', 'INCAPACIDAD_ISSS'];
        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Tipo de ausencia no valido. Debe ser uno de: AUSENCIA_INJUSTIFICADA, PERMISO_GOCE, INCAPACIDAD_ISSS'
            });
        }
        
        const estadosPermitidos = ['APROBADA', 'RECHAZADA', 'PENDIENTE'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Estado no valido. Debe ser uno de: APROBADA, RECHAZADA, PENDIENTE'
            });
        }
        
        const inicio = new Date(fecha_inicio);
        const fin = new Date(fecha_fin);
        if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'Formatos de fecha no validos'
            });
        }
        if (inicio > fin) {
            return res.status(400).json({
                status: 'error',
                error: 'VALIDATION_ERROR',
                message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
            });
        }
        
        const [empleadoRows] = await db.query('SELECT id FROM empleados WHERE id = ?', [id_empleado]);
        if (empleadoRows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'El empleado especificado no existe'
            });
        }
        
        const [registroRows] = await db.query('SELECT id FROM ausencias_incapacidades WHERE id = ?', [id]);
        if (registroRows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Registro de ausencia o incapacidad no encontrado'
            });
        }
        
        const query = `
            UPDATE ausencias_incapacidades
            SET id_empleado = ?, tipo = ?, fecha_inicio = ?, fecha_fin = ?, motivo = ?, estado = ?
            WHERE id = ?
        `;
        await db.query(query, [id_empleado, tipo, fecha_inicio, fecha_fin, motivo || null, estado, id]);
        
        res.json({
            status: 'success',
            data: { id },
            message: 'Ausencia o incapacidad actualizada exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al actualizar la ausencia o incapacidad'
        });
    }
};

exports.deleteAusenciaIncapacidad = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM ausencias_incapacidades WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Registro de ausencia o incapacidad no encontrado'
            });
        }
        
        res.json({
            status: 'success',
            data: { id },
            message: 'Ausencia o incapacidad eliminada exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al eliminar la ausencia o incapacidad'
        });
    }
};
