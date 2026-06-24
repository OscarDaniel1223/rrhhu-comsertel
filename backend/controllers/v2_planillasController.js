const db = require('../config/db');
const V2_PayrollService = require('../services/v2_payrollService');

/**
 * Obtener listado de todas las planillas registradas.
 */
const getPlanillas = async (req, res) => {
    try {
        const query = `
            SELECT id, fecha_inicio, fecha_fin, tipo_periodo, estado, creado_en
            FROM planillas
            ORDER BY creado_en DESC
        `;
        const [rows] = await db.query(query);
        res.json({
            status: 'success',
            data: rows,
            message: 'Planillas obtenidas exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener las planillas'
        });
    }
};

/**
 * Obtener el detalle de una planilla, sus boletas asociadas y el consolidado de costos.
 */
const getPlanillaById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Obtener datos de la planilla
        const [planillaRows] = await db.query('SELECT * FROM planillas WHERE id = ?', [id]);
        if (planillaRows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Planilla no encontrada'
            });
        }
        const planilla = planillaRows[0];

        // 2. Obtener boletas de pago asociadas con datos del empleado
        const boletasQuery = `
            SELECT b.*, b.incaf_patrono AS insaforp_patrono, e.nombres, e.apellidos, e.dui, e.nit, e.fecha_ingreso, e.fecha_aguinaldo, c.titulo AS cargo, c.salario_base, d.nombre AS area
            FROM boletas_pago b
            JOIN empleados e ON b.id_empleado = e.id
            JOIN cargos c ON e.id_cargo = c.id
            JOIN rh_departamentos d ON c.id_departamento = d.id
            WHERE b.id_planilla = ?
        `;
        const [boletas] = await db.query(boletasQuery, [id]);

        // 3. Calcular consolidados de costos de la planilla
        let totalSalariosDevengados = 0;
        let totalISSSEmpleado = 0;
        let totalAFPEmpleado = 0;
        let totalRenta = 0;
        let totalSalariosNetos = 0;
        let totalISSSPatrono = 0;
        let totalAFPPatrono = 0;
        let totalInsaforpPatrono = 0;
        let totalBeneficios = 0;
        let totalVacaciones = 0;
        let totalAguinaldo = 0;
        let totalQuincenaVeinticinco = 0;

        boletas.forEach(b => {
            totalSalariosDevengados += Number(b.salario_devengado);
            totalISSSEmpleado += Number(b.isss_empleado);
            totalAFPEmpleado += Number(b.afp_empleado);
            totalRenta += Number(b.renta);
            totalSalariosNetos += Number(b.salario_neto);
            totalISSSPatrono += Number(b.isss_patrono);
            totalAFPPatrono += Number(b.afp_patrono);
            totalInsaforpPatrono += Number(b.insaforp_patrono);
            totalBeneficios += Number(b.beneficios || 0.0);
            totalVacaciones += Number(b.vacaciones || 0.0);
            totalAguinaldo += Number(b.aguinaldo || 0.0);
            totalQuincenaVeinticinco += Number(b.quincena_veinticinco || 0.0);
        });

        const totalAportesPatronales = totalISSSPatrono + totalAFPPatrono + totalInsaforpPatrono;
        const totalCostoPatronal = totalSalariosDevengados + totalAportesPatronales;

        const resumen = {
            total_salarios_devengados: Math.round(totalSalariosDevengados * 100) / 100,
            total_isss_empleado: Math.round(totalISSSEmpleado * 100) / 100,
            total_afp_empleado: Math.round(totalAFPEmpleado * 100) / 100,
            total_renta: Math.round(totalRenta * 100) / 100,
            total_salarios_netos: Math.round(totalSalariosNetos * 100) / 100,
            total_isss_patrono: Math.round(totalISSSPatrono * 100) / 100,
            total_afp_patrono: Math.round(totalAFPPatrono * 100) / 100,
            total_insaforp_patrono: Math.round(totalInsaforpPatrono * 100) / 100,
            total_aportes_patronales: Math.round(totalAportesPatronales * 100) / 100,
            total_costo_patronal: Math.round(totalCostoPatronal * 100) / 100,
            total_beneficios: Math.round(totalBeneficios * 100) / 100,
            total_vacaciones: Math.round(totalVacaciones * 100) / 100,
            total_aguinaldo: Math.round(totalAguinaldo * 100) / 100,
            total_quincena_veinticinco: Math.round(totalQuincenaVeinticinco * 100) / 100
        };

        res.json({
            status: 'success',
            data: {
                planilla,
                resumen,
                boletas
            },
            message: 'Detalle de planilla obtenido exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al obtener el detalle de la planilla'
        });
    }
};

/**
 * Genera una nueva planilla de sueldos para el período especificado y sus respectivas boletas.
 */
const generarPlanilla = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { fecha_inicio, fecha_fin, tipo_periodo, novedades = [], esVoluntarioAceptado = true, fechaPagoQ25 } = req.body;

        if (!fecha_inicio || !fecha_fin || !tipo_periodo) {
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'BAD_REQUEST',
                message: 'Los campos fecha_inicio, fecha_fin y tipo_periodo son requeridos.'
            });
        }

        if (tipo_periodo !== 'QUINCENAL' && tipo_periodo !== 'MENSUAL') {
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'BAD_REQUEST',
                message: 'El tipo_periodo debe ser QUINCENAL o MENSUAL.'
            });
        }

        // Obtener año y mes de la planilla a generar (usando fecha_inicio)
        const fInicioPlanilla = new Date(fecha_inicio + 'T00:00:00');
        if (isNaN(fInicioPlanilla.getTime())) {
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'BAD_REQUEST',
                message: 'La fecha de inicio no es válida.'
            });
        }
        const anioPlanilla = fInicioPlanilla.getFullYear();
        const mesPlanilla = fInicioPlanilla.getMonth() + 1; // 1 a 12

        // Obtener año y mes actual del sistema
        const hoy = new Date();
        const anioActual = hoy.getFullYear();
        const mesActual = hoy.getMonth() + 1; // 1 a 12

        /* BYPASS TEMPORAL DE RESTRICCIONES DE FECHA (TAREA 19 - SPRINT 5)
        // 1. Validar que no se generen planillas para meses pasados
        if (anioPlanilla < anioActual || (anioPlanilla === anioActual && mesPlanilla < mesActual)) {
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'PAST_MONTH_NOT_ALLOWED',
                message: 'No se pueden generar planillas para meses anteriores al mes actual.'
            });
        }

        // 2. Validar que no se intente generar para meses más allá del mes siguiente
        const mesesDiferencia = (anioPlanilla - anioActual) * 12 + (mesPlanilla - mesActual);
        if (mesesDiferencia > 1) {
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'FUTURE_MONTH_NOT_ALLOWED',
                message: 'Solo se pueden generar planillas para el mes actual o el mes siguiente.'
            });
        }

        // 3. Si se intenta generar el mes siguiente, validar que el mes actual esté cerrado
        if (mesesDiferencia === 1) {
            const [planillasMesActual] = await connection.query(
                `SELECT estado FROM planillas 
                 WHERE YEAR(fecha_inicio) = ? AND MONTH(fecha_inicio) = ?`,
                [anioActual, mesActual]
            );

            if (planillasMesActual.length === 0) {
                connection.release();
                return res.status(400).json({
                    status: 'error',
                    error: 'CURRENT_MONTH_NOT_GENERATED',
                    message: 'No se puede generar la planilla del mes siguiente porque aún no se han generado las planillas del mes actual.'
                });
            }

            const algunaAbierta = planillasMesActual.some(p => p.estado !== 'CERRADA');
            if (algunaAbierta) {
                connection.release();
                return res.status(400).json({
                    status: 'error',
                    error: 'CURRENT_MONTH_NOT_CLOSED',
                    message: 'No se puede generar la planilla del mes siguiente hasta que todas las planillas del mes actual estén en estado CERRADA.'
                });
            }
        }
        FIN DE BYPASS TEMPORAL */

        // 4. Validar que no exista ya una planilla registrada para ese rango exacto y tipo
        const [planillasExistentes] = await connection.query(
            `SELECT id FROM planillas 
             WHERE fecha_inicio = ? AND fecha_fin = ? AND tipo_periodo = ?`,
            [fecha_inicio, fecha_fin, tipo_periodo]
        );
        if (planillasExistentes.length > 0) {
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'PLANILLA_ALREADY_EXISTS',
                message: 'Ya existe una planilla registrada para el período y rango de fechas especificados.'
            });
        }

        // Iniciar transacción
        await connection.beginTransaction();

        // 1. Crear el registro de la planilla
        const [planillaResult] = await connection.query(
            'INSERT INTO planillas (fecha_inicio, fecha_fin, tipo_periodo, estado) VALUES (?, ?, ?, "BORRADOR")',
            [fecha_inicio, fecha_fin, tipo_periodo]
        );
        const id_planilla = planillaResult.insertId;

        // 2. Obtener los empleados activos
        const [empleados] = await connection.query(
            `SELECT e.id, e.fecha_ingreso, e.mes_vacaciones, e.fecha_aguinaldo, c.salario_base 
             FROM empleados e
             JOIN cargos c ON e.id_cargo = c.id
             WHERE e.estado = 'ACTIVO'`
        );

        if (empleados.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'NO_ACTIVE_EMPLOYEES',
                message: 'No existen empleados activos para generar la planilla.'
            });
        }

        const totalEmpleadosEmpresa = empleados.length;

        // Mapear novedades del body por id_empleado para rápido acceso
        const novedadesMap = new Map();
        novedades.forEach(nov => {
            novedadesMap.set(Number(nov.id_empleado), {
                beneficios: Number(nov.beneficios || 0.0),
                vacaciones: Number(nov.vacaciones || 0.0),
                viaticos: Number(nov.viaticos || 0.0),
                horas_extras_diurnas: Number(nov.horas_extras_diurnas || 0.0),
                horas_extras_nocturnas: Number(nov.horas_extras_nocturnas || 0.0)
            });
        });

        // 3. Procesar los cálculos de nómina para cada empleado
        for (const empleado of empleados) {
            const id_empleado = empleado.id;
            const salarioBase = Number(empleado.salario_base);
            const fechaIngreso = empleado.fecha_ingreso;

            // Obtener ausencias aprobadas del empleado que traslapen con la planilla
            const [ausencias] = await connection.query(
                `SELECT tipo, fecha_inicio, fecha_fin, estado 
                 FROM ausencias_incapacidades 
                 WHERE id_empleado = ? AND estado = 'APROBADA'
                   AND (
                     (fecha_inicio BETWEEN ? AND ?) OR
                     (fecha_fin BETWEEN ? AND ?) OR
                     (fecha_inicio <= ? AND fecha_fin >= ?)
                   )`,
                [id_empleado, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin, fecha_inicio, fecha_fin]
            );

            // Obtener beneficios o vacaciones programadas
            const nov = novedadesMap.get(id_empleado) || {
                beneficios: 0.0,
                vacaciones: 0.0,
                viaticos: 0.0,
                horas_extras_diurnas: 0.0,
                horas_extras_nocturnas: 0.0
            };

            // Calcular Quincena Veinticinco si aplica (Enero 2026 en adelante)
            let quincenaVeinticincoVal = 0.0;
            try {
                quincenaVeinticincoVal = V2_PayrollService.calcularQuincenaVeinticinco(
                    salarioBase,
                    fecha_fin,
                    fechaIngreso,
                    esVoluntarioAceptado, // esVoluntarioAceptado recibido de la peticion
                    false, // esSectorPublico (por defecto privado para Comsertel)
                    false, // esFiniquito
                    fechaPagoQ25 // fechaPagoQ25 recibida del body
                );
            } catch (err) {
                console.error(`Error calculando Quincena Veinticinco para empleado ${id_empleado}:`, err);
            }

            // Calcular Aguinaldo si la fecha programada cae en el periodo de la planilla
            let aguinaldoVal = 0.0;
            if (empleado.fecha_aguinaldo) {
                try {
                    const parseFecha = (f) => {
                        if (!f) return null;
                        if (f instanceof Date) {
                            return new Date(f.getFullYear(), f.getMonth(), f.getDate());
                        }
                        const str = f.toString().split('T')[0];
                        const partes = str.split('-');
                        if (partes.length === 3) {
                            return new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
                        }
                        const d = new Date(f);
                        return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
                    };

                    const fAguinaldo = parseFecha(empleado.fecha_aguinaldo);
                    const fInicio = parseFecha(fecha_inicio);
                    const fFin = parseFecha(fecha_fin);

                    if (fAguinaldo && fInicio && fFin && fAguinaldo >= fInicio && fAguinaldo <= fFin) {
                        aguinaldoVal = V2_PayrollService.calcularAguinaldo(salarioBase, fechaIngreso, fecha_fin);
                    }
                } catch (err) {
                    console.error(`Error calculando Aguinaldo para empleado ${id_empleado}:`, err);
                }
            }

            // Calcular Vacaciones si el mes de la planilla coincide con el mes conciliado de goce
            let vacacionesVal = 0.0;
            if (empleado.mes_vacaciones !== null && empleado.mes_vacaciones === mesPlanilla) {
                try {
                    vacacionesVal = V2_PayrollService.calcularVacaciones(
                        salarioBase,
                        fechaIngreso,
                        fecha_fin,
                        true // cumpleAnioContinuo
                    );
                } catch (err) {
                    console.error(`Error calculando Vacaciones para empleado ${id_empleado}:`, err);
                    vacacionesVal = 0.0;
                }
            }

            // Ejecutar el motor de cálculo de boleta de pago
            const boletaDesglose = V2_PayrollService.calcularBoletaPago(
                salarioBase,
                ausencias,
                nov.beneficios,
                aguinaldoVal,
                vacacionesVal,
                tipo_periodo,
                fecha_inicio,
                fecha_fin,
                totalEmpleadosEmpresa,
                quincenaVeinticincoVal,
                false, // esSectorAgropecuario
                false, // esTemporalAgricola
                nov.viaticos,
                nov.horas_extras_diurnas,
                nov.horas_extras_nocturnas
            );

            // Guardar en la base de datos la boleta de pago consolidada
            await connection.query(
                `INSERT INTO boletas_pago (
                    id_planilla, id_empleado, dias_trabajados, salario_devengado,
                    isss_empleado, afp_empleado, renta, salario_neto,
                    isss_patrono, afp_patrono, incaf_patrono,
                    beneficios, vacaciones, aguinaldo, quincena_veinticinco,
                    viaticos, horas_extras_diurnas, horas_extras_nocturnas
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id_planilla,
                    id_empleado,
                    boletaDesglose.dias_trabajados,
                    boletaDesglose.salario_devengado,
                    boletaDesglose.isss_empleado,
                    boletaDesglose.afp_empleado,
                    boletaDesglose.renta,
                    boletaDesglose.salario_neto,
                    boletaDesglose.isss_patrono,
                    boletaDesglose.afp_patrono,
                    boletaDesglose.incaf_patrono,
                    nov.beneficios,
                    vacacionesVal,
                    aguinaldoVal,
                    quincenaVeinticincoVal,
                    boletaDesglose.viaticos,
                    boletaDesglose.horas_extras_diurnas,
                    boletaDesglose.horas_extras_nocturnas
                ]
            );
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            status: 'success',
            data: {
                id_planilla,
                boletas_generadas: totalEmpleadosEmpresa
            },
            message: 'Planilla generada y procesada exitosamente.'
        });

    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al generar la planilla.'
        });
    }
};

/**
 * Cierra la planilla especificando que ya está procesada de forma definitiva.
 */
const cerrarPlanilla = async (req, res) => {
    try {
        const { id } = req.params;

        const [planillaRows] = await db.query('SELECT estado FROM planillas WHERE id = ?', [id]);
        if (planillaRows.length === 0) {
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Planilla no encontrada'
            });
        }

        if (planillaRows[0].estado === 'CERRADA') {
            return res.status(400).json({
                status: 'error',
                error: 'ALREADY_CLOSED',
                message: 'La planilla ya se encuentra en estado CERRADA.'
            });
        }

        await db.query('UPDATE planillas SET estado = "CERRADA" WHERE id = ?', [id]);

        res.json({
            status: 'success',
            message: 'Planilla cerrada exitosamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al cerrar la planilla'
        });
    }
};

/**
 * Elimina una planilla y todas sus boletas de pago asociadas (solo si está en BORRADOR).
 */
const deletePlanilla = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;

        const [planillaRows] = await connection.query('SELECT estado FROM planillas WHERE id = ?', [id]);
        if (planillaRows.length === 0) {
            connection.release();
            return res.status(404).json({
                status: 'error',
                error: 'NOT_FOUND',
                message: 'Planilla no encontrada'
            });
        }

        await connection.beginTransaction();

        // Eliminar boletas de pago asociadas primero por FK constraint
        await connection.query('DELETE FROM boletas_pago WHERE id_planilla = ?', [id]);
        // Eliminar la planilla
        await connection.query('DELETE FROM planillas WHERE id = ?', [id]);

        await connection.commit();
        connection.release();

        res.json({
            status: 'success',
            message: 'Planilla y boletas de pago asociadas eliminadas exitosamente'
        });
    } catch (error) {
        await connection.rollback();
        connection.release();
        console.error(error);
        res.status(500).json({
            status: 'error',
            error: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor al eliminar la planilla'
        });
    }
};

module.exports = {
    getPlanillas,
    getPlanillaById,
    generarPlanilla,
    cerrarPlanilla,
    deletePlanilla
};
