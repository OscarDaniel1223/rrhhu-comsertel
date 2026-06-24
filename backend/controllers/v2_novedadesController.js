const db = require('../config/db');

/**
 * Obtiene las novedades registradas.
 * - Si se envia 'fecha' (YYYY-MM-DD), devuelve los registros exactos de ese dia.
 * - Si se envia 'fecha_inicio' y 'fecha_fin', devuelve las sumas acumuladas por empleado en dicho rango de fechas.
 */
const getNovedades = async (req, res) => {
    try {
        const { fecha, fecha_inicio, fecha_fin } = req.query;

        if (!fecha && (!fecha_inicio || !fecha_fin)) {
            return res.status(400).json({
                status: 'error',
                error: 'BAD_REQUEST',
                message: 'Debe proporcionar la fecha exacta o un rango de fechas (fecha_inicio y fecha_fin).'
            });
        }

        if (fecha) {
            // Consulta para una fecha especifica (Registro Diario)
            const query = `
                SELECT n.*, e.nombres, e.apellidos, c.salario_base
                FROM novedades_empleados n
                JOIN empleados e ON n.id_empleado = e.id
                JOIN cargos c ON e.id_cargo = c.id
                WHERE n.fecha = ?
            `;
            const [rows] = await db.query(query, [fecha]);
            return res.json({
                status: 'success',
                data: rows,
                message: 'Novedades diarias obtenidas exitosamente'
            });
        } else {
            // Consulta para acumular por rango de fechas (Generar Planilla)
            const query = `
                SELECT 
                    n.id_empleado,
                    SUM(n.horas_extras_diurnas) AS horas_extras_diurnas,
                    SUM(n.horas_extras_nocturnas) AS horas_extras_nocturnas,
                    SUM(n.viaticos) AS viaticos,
                    SUM(n.beneficios) AS beneficios,
                    e.nombres,
                    e.apellidos,
                    c.salario_base
                FROM novedades_empleados n
                JOIN empleados e ON n.id_empleado = e.id
                JOIN cargos c ON e.id_cargo = c.id
                WHERE n.fecha BETWEEN ? AND ?
                GROUP BY n.id_empleado, e.nombres, e.apellidos, c.salario_base
            `;
            const [rows] = await db.query(query, [fecha_inicio, fecha_fin]);
            return res.json({
                status: 'success',
                data: rows,
                message: 'Consolidado de novedades obtenido exitosamente para el periodo'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener las novedades'
        });
    }
};

/**
 * Guarda o actualiza una lista de novedades de empleados para una fecha especifica.
 */
const saveNovedades = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { fecha, novedades = [] } = req.body;

        if (!fecha) {
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'BAD_REQUEST',
                message: 'El campo fecha es requerido.'
            });
        }

        await connection.beginTransaction();

        const queryUpsert = `
            INSERT INTO novedades_empleados (id_empleado, fecha, horas_extras_diurnas, horas_extras_nocturnas, viaticos, beneficios)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                horas_extras_diurnas = VALUES(horas_extras_diurnas),
                horas_extras_nocturnas = VALUES(horas_extras_nocturnas),
                viaticos = VALUES(viaticos),
                beneficios = VALUES(beneficios)
        `;

        for (const nov of novedades) {
            const id_empleado = parseInt(nov.id_empleado, 10);
            const horasDiurnas = parseFloat(nov.horas_extras_diurnas) || 0.00;
            const horasNocturnas = parseFloat(nov.horas_extras_nocturnas) || 0.00;
            const viaticos = parseFloat(nov.viaticos) || 0.00;
            const beneficios = parseFloat(nov.beneficios) || 0.00;

            await connection.query(queryUpsert, [
                id_empleado,
                fecha,
                horasDiurnas,
                horasNocturnas,
                viaticos,
                beneficios
            ]);
        }

        await connection.commit();
        connection.release();

        res.json({
            status: 'success',
            message: 'Novedades del dia guardadas exitosamente'
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al guardar las novedades'
        });
    }
};

module.exports = {
    getNovedades,
    saveNovedades
};
