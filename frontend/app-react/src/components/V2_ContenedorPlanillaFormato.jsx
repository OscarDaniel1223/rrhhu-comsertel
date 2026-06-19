import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getPlanillas, getPlanillaById } from '../services/v2_planillaService';

// Nombres de los meses en español para la columna "Mes que ingreso"
const NOMBRES_MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const parseFechaLocal = (fechaInput) => {
    if (!fechaInput) return null;
    if (fechaInput instanceof Date) {
        return new Date(fechaInput.getFullYear(), fechaInput.getMonth(), fechaInput.getDate());
    }
    let dateStr = fechaInput.toString();
    if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
    }
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
};

const formatFechaLocal = (fechaInput) => {
    const date = parseFechaLocal(fechaInput);
    if (!date) return 'Invalid Date';
    return date.toLocaleDateString('es-SV');
};

const formatMoneda = (valor) => {
    if (valor === null || valor === undefined) return '$0.00';
    const num = parseFloat(valor);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(num);
};

export default function V2_ContenedorPlanillaFormato() {
    const [planillas, setPlanillas] = useState([]);
    const [loadingPlanillas, setLoadingPlanillas] = useState(true);
    const [selectedPlanillaId, setSelectedPlanillaId] = useState(null);
    const [detalle, setDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [areaFilter, setAreaFilter] = useState('');

    const fetchPlanillas = async () => {
        setLoadingPlanillas(true);
        try {
            const response = await getPlanillas();
            if (response.status === 'success') {
                setPlanillas(response.data);
            }
        } catch (error) {
            console.error('Error cargando planillas:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las planillas.'
            });
        } finally {
            setLoadingPlanillas(false);
        }
    };

    const fetchDetalle = async (id) => {
        setLoadingDetalle(true);
        try {
            const response = await getPlanillaById(id);
            if (response.status === 'success') {
                setDetalle(response.data);
            }
        } catch (error) {
            console.error('Error cargando detalle planilla:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el detalle de la planilla.'
            });
            setSelectedPlanillaId(null);
        } finally {
            setLoadingDetalle(false);
        }
    };

    useEffect(() => {
        fetchPlanillas();
    }, []);

    useEffect(() => {
        if (selectedPlanillaId) {
            fetchDetalle(selectedPlanillaId);
        } else {
            setDetalle(null);
        }
    }, [selectedPlanillaId]);

    // Exportar la planilla en formato CSV
    const exportarCSV = () => {
        if (!detalle || !detalle.boletas || detalle.boletas.length === 0) return;

        const headers = [
            'N°', 'Area', 'Puesto', 'Fecha de ingreso', 'Fecha de corte de la planilla',
            'Sueldo-Salario', 'Viaticos', 'Mes que ingreso a la empresa', 'Tiempo en la empresa (años)',
            'Horas extras diurnas', 'Horas extras nocturnas', 'Monto de vacaciones', 'Bonificacion de vacaciones',
            'Monto del aguinaldo', 'Quincena Veinticinco', 'Monto cotizables para cotizaciones',
            'ISSS Patronal', 'AFP Patronal', 'ISSS Empleado', 'AFP Empleado', 'Impuesto sobre la Renta (ISR)',
            'Monto a depositar al empleado', 'Monto a depositar planilla unica'
        ];

        const rows = processedBoletas.map((b, idx) => {
            return [
                idx + 1,
                b.area,
                b.cargo,
                b.fechaIngresoFormato,
                b.fechaCorteFormato,
                b.sueldoSalario,
                b.viaticos,
                b.mesIngreso,
                b.tiempoEmpresaAnios,
                b.horasExtrasDiurnas,
                b.horasExtrasNocturnas,
                b.montoVacaciones,
                b.boniVacaciones,
                b.aguinaldo,
                b.quincenaVeinticinco,
                b.montoCotizable,
                b.isssPatronal,
                b.afpPatronal,
                b.isssEmpleado,
                b.afpEmpleado,
                b.isrEmpleado,
                b.montoDepositarEmpleado,
                b.montoPlanillaUnica
            ];
        });

        // Crear contenido de CSV
        let csvContent = '\uFEFF'; // BOM para soportar tildes y caracteres especiales en Excel
        csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
        
        rows.forEach(row => {
            csvContent += row.map(val => {
                if (typeof val === 'number') return val;
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(',') + '\n';
        });

        // Fila de totales
        const totalRow = [
            'TOTALES', '', '', '', '',
            totals.sueldoSalario, totals.viaticos, '', '',
            totals.horasExtrasDiurnas, totals.horasExtrasNocturnas, totals.montoVacaciones, totals.boniVacaciones,
            totals.aguinaldo, totals.quincenaVeinticinco, totals.montoCotizable,
            totals.isssPatronal, totals.afpPatronal, totals.isssEmpleado, totals.afpEmpleado, totals.isrEmpleado,
            totals.montoDepositarEmpleado, totals.montoPlanillaUnica
        ];

        csvContent += totalRow.map(val => {
            if (val === 'TOTALES' || val === '') return `"${val}"`;
            return val;
        }).join(',') + '\n';

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Planilla_Formato_${detalle.planilla.tipo_periodo}_${detalle.planilla.fecha_inicio}_al_${detalle.planilla.fecha_fin}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Procesar datos de las boletas calculando columnas dinámicas
    const getProcessedBoletas = () => {
        if (!detalle || !detalle.boletas) return [];

        return detalle.boletas.map((b) => {
            const fechaIngresoDate = parseFechaLocal(b.fecha_ingreso);
            const fechaFinPlanillaDate = parseFechaLocal(detalle.planilla.fecha_fin);
            
            // Tiempo en la empresa (años)
            let tiempoAnios = 0;
            if (fechaIngresoDate && fechaFinPlanillaDate) {
                const diffTime = fechaFinPlanillaDate.getTime() - fechaIngresoDate.getTime();
                if (diffTime > 0) {
                    tiempoAnios = Math.round((diffTime / (1000 * 60 * 60 * 24 * 365.25)) * 100) / 100;
                }
            }
            // Salario Base Nominal
            const sueldoSalario = parseFloat(b.salario_base) || 0.0;

            // Desglose de Vacaciones
            const vacacionesTotal = parseFloat(b.vacaciones) || 0.0;
            let montoVacaciones = 0.0;
            let boniVacaciones = 0.0;
            
            if (vacacionesTotal > 0) {
                montoVacaciones = vacacionesTotal / 1.30;
                boniVacaciones = montoVacaciones * 0.30;
            }

            // Monto Cotizable
            // En El Salvador es el salario base ordinario devengado más vacaciones pagadas (y otros beneficios ordinarios, menos ausencias).
            // Excluye Aguinaldo y Quincena 25.
            // Para simplificar, usamos: salario_devengado - aguinaldo - quincena_veinticinco
            const salarioDevengado = parseFloat(b.salario_devengado) || 0.0;
            const aguinaldo = parseFloat(b.aguinaldo) || 0.0;
            const quincenaVeinticinco = parseFloat(b.quincena_veinticinco) || 0.0;
            const montoCotizable = Math.max(0, salarioDevengado - aguinaldo - quincenaVeinticinco);

            // Monto a depositar planilla única: suma de todas las retenciones y aportaciones del empleado/patrono al ISSS, AFP e INCAF.
            const isssPatronal = parseFloat(b.isss_patrono) || 0.0;
            const afpPatronal = parseFloat(b.afp_patrono) || 0.0;
            const incafPatronal = parseFloat(b.incaf_patrono) || 0.0;
            const isssEmpleado = parseFloat(b.isss_empleado) || 0.0;
            const afpEmpleado = parseFloat(b.afp_empleado) || 0.0;
            const isrEmpleado = parseFloat(b.renta) || 0.0;

            const montoPlanillaUnica = isssPatronal + afpPatronal + incafPatronal + isssEmpleado + afpEmpleado + isrEmpleado;

            return {
                id: b.id,
                nombres: b.nombres,
                apellidos: b.apellidos,
                area: b.area || 'Back Office',
                cargo: b.cargo,
                fechaIngresoFormato: formatFechaLocal(b.fecha_ingreso),
                fechaCorteFormato: formatFechaLocal(detalle.planilla.fecha_fin),
                sueldoSalario: sueldoSalario,
                viaticos: parseFloat(b.viaticos) || 0.00,
                mesIngreso: fechaIngresoDate ? String(fechaIngresoDate.getMonth() + 1) : '',
                tiempoEmpresaAnios: tiempoAnios,
                horasExtrasDiurnas: parseFloat(b.horas_extras_diurnas) || 0.00,
                horasExtrasNocturnas: parseFloat(b.horas_extras_nocturnas) || 0.00,
                montoVacaciones: parseFloat(montoVacaciones.toFixed(2)),
                boniVacaciones: parseFloat(boniVacaciones.toFixed(2)),
                aguinaldo: aguinaldo,
                quincenaVeinticinco: quincenaVeinticinco,
                montoCotizable: parseFloat(montoCotizable.toFixed(2)),
                isssPatronal: isssPatronal,
                afpPatronal: afpPatronal,
                incafPatronal: incafPatronal,
                isssEmpleado: isssEmpleado,
                afpEmpleado: afpEmpleado,
                isrEmpleado: isrEmpleado,
                montoDepositarEmpleado: parseFloat(b.salario_neto) || 0.0,
                montoPlanillaUnica: parseFloat(montoPlanillaUnica.toFixed(2))
            };
        });
    };

    const processedBoletas = getProcessedBoletas();

    // Filtrar boletas por búsqueda y área
    const filteredBoletas = processedBoletas.filter((b) => {
        const matchesSearch = `${b.nombres} ${b.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) || b.cargo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesArea = areaFilter === '' || b.area === areaFilter;
        return matchesSearch && matchesArea;
    });

    // Obtener áreas únicas para filtro
    const uniqueAreas = Array.from(new Set(processedBoletas.map(b => b.area)));

    // Calcular Totales
    const getTotals = () => {
        const sums = {
            sueldoSalario: 0,
            viaticos: 0,
            horasExtrasDiurnas: 0,
            horasExtrasNocturnas: 0,
            montoVacaciones: 0,
            boniVacaciones: 0,
            aguinaldo: 0,
            quincenaVeinticinco: 0,
            montoCotizable: 0,
            isssPatronal: 0,
            afpPatronal: 0,
            incafPatronal: 0,
            isssEmpleado: 0,
            afpEmpleado: 0,
            isrEmpleado: 0,
            montoDepositarEmpleado: 0,
            montoPlanillaUnica: 0
        };

        filteredBoletas.forEach((b) => {
            sums.sueldoSalario += b.sueldoSalario;
            sums.viaticos += b.viaticos;
            sums.horasExtrasDiurnas += b.horasExtrasDiurnas;
            sums.horasExtrasNocturnas += b.horasExtrasNocturnas;
            sums.montoVacaciones += b.montoVacaciones;
            sums.boniVacaciones += b.boniVacaciones;
            sums.aguinaldo += b.aguinaldo;
            sums.quincenaVeinticinco += b.quincenaVeinticinco;
            sums.montoCotizable += b.montoCotizable;
            sums.isssPatronal += b.isssPatronal;
            sums.afpPatronal += b.afpPatronal;
            sums.incafPatronal += b.incafPatronal;
            sums.isssEmpleado += b.isssEmpleado;
            sums.afpEmpleado += b.afpEmpleado;
            sums.isrEmpleado += b.isrEmpleado;
            sums.montoDepositarEmpleado += b.montoDepositarEmpleado;
            sums.montoPlanillaUnica += b.montoPlanillaUnica;
        });

        // Redondear a 2 decimales
        Object.keys(sums).forEach(key => {
            sums[key] = parseFloat(sums[key].toFixed(2));
        });

        return sums;
    };

    const totals = getTotals();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="container mx-auto p-4 lg:p-6 transition-all duration-200">
            {/* Cabecera Principal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                        <i className="bi bi-file-earmark-spreadsheet text-blue-600"></i>
                        Formato Planilla Consolidada
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Visualizacion de planillas generadas bajo el formato extendido de reporte unico de nomina.
                    </p>
                </div>
            </div>

            {/* Estilos CSS para impresion en formato horizontal (Landscape) */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    /* Ocultar elementos innecesarios */
                    #root, .nav_contenedor, header, footer, .print-hidden, .print\\:hidden {
                        display: none !important;
                    }
                    /* Ajustar cuerpo para usar todo el ancho de pagina horizontal */
                    html, body {
                        width: 100% !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        color: black !important;
                    }
                    /* Forzar orientacion horizontal */
                    @page {
                        size: A4 landscape;
                        margin: 5mm;
                    }
                    .print-area {
                        display: block !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .print-table {
                        font-size: 8px !important;
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    .print-table th, .print-table td {
                        border: 1px solid #ccc !important;
                        padding: 2px 4px !important;
                        white-space: nowrap !important;
                    }
                    .print-header-info {
                        display: block !important;
                        margin-bottom: 10px !important;
                        text-align: center !important;
                    }
                }
            `}} />

            {/* VISTA 1: Seleccion de Planilla */}
            {!selectedPlanillaId && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Seleccione una Planilla</h2>
                    {loadingPlanillas ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : planillas.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                            <i className="bi bi-folder-x text-4xl block mb-2 text-slate-300"></i>
                            No hay planillas registradas en el sistema.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {planillas.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setSelectedPlanillaId(p.id)}
                                    className="flex flex-col text-left p-5 bg-slate-50 hover:bg-blue-50/50 dark:bg-slate-800/40 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all duration-200 hover:border-blue-300 dark:hover:border-slate-700 cursor-pointer"
                                >
                                    <div className="flex items-center justify-between w-full mb-3">
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                                            {p.tipo_periodo}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            p.estado === 'CERRADA' 
                                                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' 
                                                : 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400'
                                        }`}>
                                            {p.estado}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 dark:text-white text-md">
                                        Planilla N° {p.id}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                                        <i className="bi bi-calendar3"></i>
                                        {formatFechaLocal(p.fecha_inicio)} - {formatFechaLocal(p.fecha_fin)}
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 w-full flex justify-between items-center text-xs font-semibold text-blue-600 dark:text-blue-400">
                                        Ver Formato Planilla
                                        <i className="bi bi-arrow-right"></i>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* VISTA 2: Detalle en Formato Planilla Gigante */}
            {selectedPlanillaId && (
                <div className="space-y-6 print-area">
                    {/* Boton para regresar y acciones (Oculto al imprimir) */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm print:hidden">
                        <button
                            onClick={() => setSelectedPlanillaId(null)}
                            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <i className="bi bi-chevron-left"></i>
                            Regresar a Planillas
                        </button>
                        
                        {detalle && (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={exportarCSV}
                                    className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <i className="bi bi-file-earmark-excel"></i>
                                    Exportar Excel (CSV)
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                    <i className="bi bi-printer"></i>
                                    Imprimir Reporte
                                </button>
                            </div>
                        )}
                    </div>

                    {loadingDetalle && (
                        <div className="flex justify-center items-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Detalle Consolidado */}
                    {detalle && !loadingDetalle && (
                        <div className="space-y-6">
                            {/* Titulo e info del periodo impreso */}
                            <div className="hidden print-header-info font-serif text-black">
                                <h1 className="text-lg font-bold uppercase">COMSERTEL, S.A. DE C.V.</h1>
                                <p className="text-[10px] font-semibold tracking-wider">REPORTE DETALLADO DE PLANILLA DE SUELDOS (FORMATO EXTENDIDO)</p>
                                <p className="text-[8px] text-slate-600">
                                    Periodo del {formatFechaLocal(detalle.planilla.fecha_inicio)} al {formatFechaLocal(detalle.planilla.fecha_fin)} | Tipo: {detalle.planilla.tipo_periodo}
                                </p>
                            </div>

                            {/* Filtros de Busqueda en Pantalla */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center print:hidden">
                                <div className="relative flex-1 w-full">
                                    <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-sm"></i>
                                    <input
                                        type="text"
                                        placeholder="Buscar empleado o cargo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent"
                                    />
                                </div>
                                <div className="w-full md:w-64">
                                    <select
                                        value={areaFilter}
                                        onChange={(e) => setAreaFilter(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent"
                                    >
                                        <option value="">Todas las Areas</option>
                                        {uniqueAreas.map((area, idx) => (
                                            <option key={idx} value={area}>{area}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Tabla Gigante Desplazable Horizontalmente */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center print:hidden">
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider m-0">
                                            Matriz Planilla - {detalle.planilla.tipo_periodo}
                                        </h3>
                                        <p className="text-slate-400 text-[11px] mt-0.5">
                                            Del {formatFechaLocal(detalle.planilla.fecha_inicio)} al {formatFechaLocal(detalle.planilla.fecha_fin)}
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 rounded-lg">
                                        Registros: {filteredBoletas.length} de {processedBoletas.length}
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-[11px] text-left border-collapse print-table">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">N°</th>
                                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50 sticky left-8 bg-slate-50 dark:bg-slate-900 z-10">Colaborador</th>
                                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50">Area</th>
                                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50">Puesto</th>
                                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50">Ingreso</th>
                                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50">Corte Planilla</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">Sueldo-Salario</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">Viaticos</th>
                                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50">Mes Ingreso</th>
                                                <th className="py-3 px-4 text-center border-r border-slate-100 dark:border-slate-800/50">Tiempo (años)</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">Horas Ext D.</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">Horas Ext N.</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">Monto Vac.</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">Boni Vac.</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">Aguinaldo</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">Quincena 25</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-bold">Monto Cotizable</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">ISSS Patr.</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">AFP Patr.</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">ISSS Emp.</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">AFP Emp.</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50">ISR (Renta)</th>
                                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-bold">Neto a Depositar</th>
                                                <th className="py-3 px-4 text-right font-bold">Planilla Unica</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                                            {filteredBoletas.map((b, idx) => (
                                                <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50 sticky left-0 bg-white dark:bg-slate-900 font-bold z-10">{idx + 1}</td>
                                                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50 sticky left-8 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white z-10 whitespace-nowrap">
                                                        {b.nombres} {b.apellidos}
                                                    </td>
                                                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50 whitespace-nowrap">{b.area}</td>
                                                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50 whitespace-nowrap">{b.cargo}</td>
                                                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50 whitespace-nowrap">{b.fechaIngresoFormato}</td>
                                                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50 whitespace-nowrap">{b.fechaCorteFormato}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.sueldoSalario)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.viaticos)}</td>
                                                    <td className="py-3 px-4 border-r border-slate-100 dark:border-slate-800/50 text-center">{b.mesIngreso}</td>
                                                    <td className="py-3 px-4 text-center border-r border-slate-100 dark:border-slate-800/50 font-mono">{b.tiempoEmpresaAnios}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.horasExtrasDiurnas)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.horasExtrasNocturnas)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.montoVacaciones)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.boniVacaciones)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.aguinaldo)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.quincenaVeinticinco)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono font-bold">{formatMoneda(b.montoCotizable)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.isssPatronal)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">{formatMoneda(b.afpPatronal)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">-{formatMoneda(b.isssEmpleado)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">-{formatMoneda(b.afpEmpleado)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono">-{formatMoneda(b.isrEmpleado)}</td>
                                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono font-bold">{formatMoneda(b.montoDepositarEmpleado)}</td>
                                                    <td className="py-3 px-4 text-right font-mono font-bold">{formatMoneda(b.montoPlanillaUnica)}</td>
                                                </tr>
                                            ))}

                                            {/* Fila de Totales Generales */}
                                            <tr className="bg-slate-100/80 dark:bg-slate-800/60 font-bold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                                                <td className="py-3 px-4 sticky left-0 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-10"></td>
                                                <td className="py-3 px-4 sticky left-8 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-10 whitespace-nowrap font-bold">
                                                    TOTAL PLANILLA
                                                </td>
                                                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-700" colSpan="4"></td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.sueldoSalario)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.viaticos)}</td>
                                                <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-700" colSpan="2"></td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.horasExtrasDiurnas)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.horasExtrasNocturnas)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.montoVacaciones)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.boniVacaciones)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.aguinaldo)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.quincenaVeinticinco)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.montoCotizable)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.isssPatronal)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">{formatMoneda(totals.afpPatronal)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">-{formatMoneda(totals.isssEmpleado)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">-{formatMoneda(totals.afpEmpleado)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold">-{formatMoneda(totals.isrEmpleado)}</td>
                                                <td className="py-3 px-4 text-right border-r border-slate-200 dark:border-slate-700 font-mono font-bold text-emerald-800 dark:text-emerald-400">{formatMoneda(totals.montoDepositarEmpleado)}</td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-red-800 dark:text-red-400">{formatMoneda(totals.montoPlanillaUnica)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
