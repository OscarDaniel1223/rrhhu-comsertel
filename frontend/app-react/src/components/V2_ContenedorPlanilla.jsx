import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getPlanillas, getPlanillaById, generarPlanilla, cerrarPlanilla, deletePlanilla } from '../services/v2_planillaService';
import { getEmpleados } from '../services/v2_empleadoService';

/**
 * Formatear valores a moneda de El Salvador (USD)
 */
const formatMoneda = (valor) => {
    if (valor === null || valor === undefined) return '$0.00';
    const num = parseFloat(valor);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(num);
};

/**
 * Modal para visualizar e imprimir la boleta de pago individual del empleado.
 */
const BoletaPagoModal = ({ boleta, planilla, onClose }) => {
    if (!boleta) return null;

    const handlePrint = () => {
        window.print();
    };

    const netoLetras = "Monto en Dolares de los Estados Unidos de America"; // Placeholder para evitar librerías complejas

    return (
        <div className="fixed inset-0 z-[1060] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto print:backdrop-blur-none">
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:h-full">
                
                {/* Cabecera del Modal (Oculta al imprimir) */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 print:hidden bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 m-0 text-lg">
                        <i className="bi bi-file-earmark-pdf text-blue-600"></i>
                        Boleta de Pago
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <i className="bi bi-printer"></i>
                            Imprimir
                        </button>
                        <button
                            onClick={onClose}
                            className="text-slate-500 hover:text-slate-700 dark:text-white dark:hover:text-slate-300 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <i className="bi bi-x-lg text-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Contenido Imprimible de la Boleta */}
                <div className="p-8 overflow-y-auto print:overflow-visible print:p-0 flex-1 bg-white text-black dark:bg-slate-900 dark:text-white print:bg-white print:text-black">
                    <div className="border-2 border-slate-300 p-6 rounded-xl space-y-6 print:border-slate-400 print:rounded-none">
                        
                        {/* Membrete de la Empresa */}
                        <div className="text-center pb-4 border-b border-slate-200 print:border-slate-300">
                            <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-950 dark:text-white print:text-black">COMSERTEL, S.A. DE C.V.</h2>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Servicios de Conectividad y Telecomunicaciones</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">San Salvador, El Salvador</p>
                        </div>

                        {/* Título de la Boleta */}
                        <div className="text-center">
                            <h3 className="text-md font-bold uppercase text-slate-800 dark:text-slate-200 print:text-slate-800">Boleta de Pago Individual</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Período del {new Date(planilla.fecha_inicio + 'T00:00:00').toLocaleDateString('es-SV')} al {new Date(planilla.fecha_fin + 'T00:00:00').toLocaleDateString('es-SV')} ({planilla.tipo_periodo})
                            </p>
                        </div>

                        {/* Datos del Empleado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-800/40 p-4 rounded-lg border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                            <div>
                                <p className="mb-2"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">Colaborador</span> {boleta.nombres} {boleta.apellidos}</p>
                                <p className="mb-2"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">Cargo</span> {boleta.cargo}</p>
                                <p className="mb-0"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">Salario Base Mensual</span> {formatMoneda(boleta.salario_base)}</p>
                            </div>
                            <div>
                                <p className="mb-2"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">DUI</span> {boleta.dui}</p>
                                <p className="mb-2"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">NIT</span> {boleta.nit}</p>
                                <p className="mb-0"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">Días Cancelados</span> {boleta.dias_trabajados} días</p>
                            </div>
                        </div>

                        {/* Detalle Financiero (Ingresos vs Deducciones) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            
                            {/* Ingresos / Devengados */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                                    Ingresos y Devengados
                                </div>
                                <div className="p-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Salario Proporcional:</span>
                                        <span className="font-semibold">{formatMoneda(planilla.tipo_periodo === 'QUINCENAL' ? boleta.salario_base / 2.0 : boleta.salario_base)}</span>
                                    </div>
                                    {Number(boleta.beneficios) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Beneficios / Bonos:</span>
                                            <span className="font-semibold text-emerald-600">+{formatMoneda(boleta.beneficios)}</span>
                                        </div>
                                    )}
                                    {Number(boleta.vacaciones) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Vacaciones Pagadas:</span>
                                            <span className="font-semibold text-emerald-600">+{formatMoneda(boleta.vacaciones)}</span>
                                        </div>
                                    )}
                                    {Number(boleta.aguinaldo) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Aguinaldo Exento:</span>
                                            <span className="font-semibold text-emerald-600">+{formatMoneda(boleta.aguinaldo)}</span>
                                        </div>
                                    )}
                                    {Number(boleta.quincena_veinticinco) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Quincena Veinticinco:</span>
                                            <span className="font-semibold text-emerald-600">+{formatMoneda(boleta.quincena_veinticinco)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between font-bold text-slate-800 dark:text-white">
                                        <span>Total Devengado:</span>
                                        <span>{formatMoneda(boleta.salario_devengado)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Egresos / Deducciones */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                                    Descuentos y Deducciones de Ley
                                </div>
                                <div className="p-4 space-y-2 text-sm">
                                    {Number(boleta.descuento_ausencias) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Descuento Ausencias:</span>
                                            <span className="font-semibold text-red-600">-{formatMoneda(boleta.descuento_ausencias)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Cotización Previsional AFP (7.25%):</span>
                                        <span className="font-semibold text-red-600">-{formatMoneda(boleta.afp_empleado)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Seguro Social ISSS (3.00%):</span>
                                        <span className="font-semibold text-red-600">-{formatMoneda(boleta.isss_empleado)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">Impuesto sobre la Renta (ISR):</span>
                                        <span className="font-semibold text-red-600">-{formatMoneda(boleta.renta)}</span>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between font-bold text-slate-800 dark:text-white">
                                        <span>Total Deducciones:</span>
                                        <span>
                                            {formatMoneda(
                                                parseFloat(boleta.isss_empleado) +
                                                parseFloat(boleta.afp_empleado) +
                                                parseFloat(boleta.renta) +
                                                (parseFloat(boleta.descuento_ausencias) || 0.0)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Neto a Recibir Líquido */}
                        <div className="flex flex-col md:flex-row items-center justify-between p-5 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-900 dark:bg-slate-800/80 dark:border-slate-700/80 dark:text-white print:bg-white print:border-slate-300">
                            <div>
                                <span className="font-bold text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Líquido a Recibir</span>
                                <span className="text-3xl font-mono font-bold tracking-tight">{formatMoneda(boleta.salario_neto)}</span>
                            </div>
                            <div className="text-xs text-right mt-3 md:mt-0 font-medium text-slate-400 max-w-[280px]">
                                {netoLetras}
                            </div>
                        </div>

                        {/* Sección de Aportes Patronales (Costeo Ocultable en Impresión si se desea, pero la tarea pide mostrarla) */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/40 print:bg-white print:border-slate-300">
                            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                                Información de Aportes Patronales (Costeo Empresa)
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider">AFP Patrono (8.75%)</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">{formatMoneda(boleta.afp_patrono)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider">ISSS Patrono (7.50%)</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">{formatMoneda(boleta.isss_patrono)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider">INCAF Patrono (1.00%)</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">{formatMoneda(boleta.insaforp_patrono)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Firmas de Conformidad */}
                        <div className="grid grid-cols-2 gap-12 pt-16 text-center text-xs">
                            <div className="border-t border-slate-400 pt-2 text-slate-500 font-medium dark:text-slate-400">
                                <p className="font-bold text-slate-800 dark:text-white print:text-black">COMSERTEL, S.A. DE C.V.</p>
                                <p className="mt-1">Firma y Sello del Patrono</p>
                            </div>
                            <div className="border-t border-slate-400 pt-2 text-slate-500 font-medium dark:text-slate-400">
                                <p className="font-bold text-slate-800 dark:text-white print:text-black">{boleta.nombres} {boleta.apellidos}</p>
                                <p className="mt-1">Firma de Conformidad Empleado</p>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

/**
 * Vista del Detalle consolidado de una Planilla y su listado de boletas.
 */
const PlanillaDetalleView = ({ planillaId, onBack }) => {
    const [detalle, setDetalle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBoleta, setSelectedBoleta] = useState(null);

    const fetchDetalle = async () => {
        setLoading(true);
        try {
            const response = await getPlanillaById(planillaId);
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
            onBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (planillaId) fetchDetalle();
    }, [planillaId]);

    const handleCerrarPlanilla = async () => {
        const result = await Swal.fire({
            title: '¿Cerrar esta planilla definitivamente?',
            text: "Una planilla cerrada se considera firme y no podrá modificarse o eliminarse en el futuro.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#00288e',
            cancelButtonColor: '#ba1a1a',
            confirmButtonText: 'Sí, cerrar planilla',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await cerrarPlanilla(planillaId);
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Cerrada!',
                        text: 'La planilla ha sido cerrada exitosamente.'
                    });
                    fetchDetalle();
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'No se pudo cerrar la planilla.'
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 text-sm font-medium">Procesando detalle consolidado...</p>
            </div>
        );
    }

    if (!detalle) return null;

    const { planilla, resumen, boletas } = detalle;
    const esBorrador = planilla.estado === 'BORRADOR';

    return (
        <div className="space-y-6">
            
            {/* Cabecera del detalle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <button
                    onClick={onBack}
                    className="text-slate-600 dark:text-white hover:text-blue-600 flex items-center gap-2 text-sm font-semibold cursor-pointer w-fit"
                >
                    <i className="bi bi-arrow-left-short text-xl"></i>
                    Volver al listado
                </button>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        esBorrador ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                        Estado: {planilla.estado}
                    </span>
                    {esBorrador && (
                        <button
                            onClick={handleCerrarPlanilla}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <i className="bi bi-lock"></i>
                            Cerrar Planilla
                        </button>
                    )}
                </div>
            </div>

            {/* Información General */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h2 className="text-xl font-bold">Resumen de Planilla #{planilla.id}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500 dark:text-slate-400 pt-2">
                    <p><span className="font-semibold text-slate-700 dark:text-white">Rango de fechas:</span> {new Date(planilla.fecha_inicio + 'T00:00:00').toLocaleDateString()} al {new Date(planilla.fecha_fin + 'T00:00:00').toLocaleDateString()}</p>
                    <p><span className="font-semibold text-slate-700 dark:text-white">Tipo de planilla:</span> {planilla.tipo_periodo}</p>
                    <p><span className="font-semibold text-slate-700 dark:text-white">Fecha Generación:</span> {new Date(planilla.creado_en).toLocaleString()}</p>
                </div>
            </div>

            {/* Tarjetas de Resumen Financiero Consolidadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Total Devengado</span>
                    <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white block">{formatMoneda(resumen.total_salarios_devengados)}</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Total Retenciones (Deducciones)</span>
                    <span className="text-2xl font-mono font-bold text-red-600 block">
                        -{formatMoneda(resumen.total_isss_empleado + resumen.total_afp_empleado + resumen.total_renta)}
                    </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Total Líquido a Pagar</span>
                    <span className="text-2xl font-mono font-bold text-emerald-600 block">{formatMoneda(resumen.total_salarios_netos)}</span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-1">
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Coste Total Patronal</span>
                    <span className="text-2xl font-mono font-bold text-blue-600 block">{formatMoneda(resumen.total_costo_patronal)}</span>
                </div>

            </div>

            {/* Desglose Detallado de Aportes de Ley */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 space-y-4">
                <h3 className="font-bold text-md text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 uppercase text-xs tracking-wider">Consolidado Fiscal y de Seguridad Social</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div className="space-y-3">
                        <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Aportaciones del Colaborador</h4>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">ISSS Empleado (3.00%):</span>
                            <span className="font-mono font-semibold">{formatMoneda(resumen.total_isss_empleado)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">AFP Empleado (7.25%):</span>
                            <span className="font-mono font-semibold">{formatMoneda(resumen.total_afp_empleado)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Retención Impuesto sobre la Renta (ISR):</span>
                            <span className="font-mono font-semibold">{formatMoneda(resumen.total_renta)}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Carga Social Patronal</h4>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">ISSS Patronal (7.50%):</span>
                            <span className="font-mono font-semibold">{formatMoneda(resumen.total_isss_patrono)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">AFP Patronal (8.75%):</span>
                            <span className="font-mono font-semibold">{formatMoneda(resumen.total_afp_patrono)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">INCAF Capacitación (1.00% / 0.25%):</span>
                            <span className="font-mono font-semibold">{formatMoneda(resumen.total_insaforp_patrono)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-bold text-blue-600">
                            <span>Total Aportes Patronales:</span>
                            <span className="font-mono">{formatMoneda(resumen.total_aportes_patronales)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listado de Boletas Individuales */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-md text-slate-800 dark:text-white m-0">Detalle de Empleados en Planilla</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6">Empleado</th>
                                <th className="py-4 px-6">Cargo</th>
                                <th className="py-4 px-6">Días Trabajados</th>
                                <th className="py-4 px-6 text-right">Devengado</th>
                                <th className="py-4 px-6 text-right">Deducciones</th>
                                <th className="py-4 px-6 text-right">Neto a Recibir</th>
                                <th className="py-4 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {boletas.map((b) => {
                                const totalDeducciones = parseFloat(b.isss_empleado) + parseFloat(b.afp_empleado) + parseFloat(b.renta) + (parseFloat(b.descuento_ausencias) || 0.0);
                                return (
                                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">
                                            {b.nombres} {b.apellidos}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{b.cargo}</td>
                                        <td className="py-4 px-6 font-medium">{b.dias_trabajados} días</td>
                                        <td className="py-4 px-6 text-right font-mono font-medium">{formatMoneda(b.salario_devengado)}</td>
                                        <td className="py-4 px-6 text-right font-mono font-medium text-red-500">-{formatMoneda(totalDeducciones)}</td>
                                        <td className="py-4 px-6 text-right font-mono font-bold text-emerald-600">{formatMoneda(b.salario_neto)}</td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => setSelectedBoleta(b)}
                                                className="border border-blue-600 hover:bg-blue-50 text-blue-600 dark:border-white dark:text-white dark:hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                            >
                                                Ver Boleta
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de visualización de boleta */}
            {selectedBoleta && (
                <BoletaPagoModal
                    boleta={selectedBoleta}
                    planilla={planilla}
                    onClose={() => setSelectedBoleta(null)}
                />
            )}

        </div>
    );
};

/**
 * Pestaña para Generar una nueva Planilla y registrar novedades/beneficios.
 */
const PlanillaGenerarTab = ({ onBack }) => {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [tipoPeriodo, setTipoPeriodo] = useState('MENSUAL');
    const [empleados, setEmpleados] = useState([]);
    const [novedades, setNovedades] = useState({}); // { [id_empleado]: { beneficios: number, vacaciones: number } }
    const [loading, setLoading] = useState(false);
    const [loadingEmpleados, setLoadingEmpleados] = useState(true);

    useEffect(() => {
        const fetchEmpleadosActivos = async () => {
            setLoadingEmpleados(true);
            try {
                const response = await getEmpleados();
                if (response.status === 'success') {
                    // Filtrar solo los empleados activos
                    const activos = response.data.filter(e => e.estado === 'ACTIVO');
                    setEmpleados(activos);
                    // Inicializar novedades
                    const initNov = {};
                    activos.forEach(e => {
                        initNov[e.id] = { beneficios: '', vacaciones: '' };
                    });
                    setNovedades(initNov);
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo obtener el listado de empleados.'
                });
            } finally {
                setLoadingEmpleados(false);
            }
        };

        fetchEmpleadosActivos();
    }, []);

    const handleNovedadChange = (empleadoId, campo, valor) => {
        setNovedades(prev => ({
            ...prev,
            [empleadoId]: {
                ...prev[empleadoId],
                [campo]: valor
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fechaInicio || !fechaFin || !tipoPeriodo) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor complete el período y rango de fechas.'
            });
            return;
        }

        // Formatear novedades para enviar al backend
        const novedadesEnviar = Object.keys(novedades)
            .map(empId => {
                const ben = parseFloat(novedades[empId].beneficios) || 0.0;
                const vac = parseFloat(novedades[empId].vacaciones) || 0.0;
                if (ben > 0 || vac > 0) {
                    return {
                        id_empleado: Number(empId),
                        beneficios: ben,
                        vacaciones: vac
                    };
                }
                return null;
            })
            .filter(n => n !== null);

        setLoading(true);
        try {
            const response = await generarPlanilla({
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                tipo_periodo: tipoPeriodo,
                novedades: novedadesEnviar
            });

            if (response.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Operación Exitosa!',
                    text: `La planilla ha sido generada correctamente con ${response.data.boletas_generadas} boletas de pago.`
                });
                onBack();
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error al generar planilla',
                text: error.message || 'Error interno del servidor.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Cabecera y Rango del período */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm text-left">
                <h3 className="font-bold text-slate-800 dark:text-white text-md uppercase text-xs tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">Configurar Período de Planilla</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Periodo</label>
                        <select
                            value={tipoPeriodo}
                            onChange={(e) => setTipoPeriodo(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        >
                            <option value="MENSUAL">Mensual (30 días)</option>
                            <option value="QUINCENAL">Quincenal (15 días)</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Inicio</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            required
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha Fin</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            required
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Listado de Novedades por Empleado */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-left">
                    <h3 className="font-bold text-slate-800 dark:text-white text-md uppercase text-xs tracking-wider m-0">Registrar Novedades y Prestaciones Adicionales</h3>
                    <p className="text-slate-400 text-xs mt-1">Ingresa bonificaciones o pagos de vacaciones que deban liquidarse en esta planilla (opcional).</p>
                </div>

                {loadingEmpleados ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    <th className="py-4 px-6">Colaborador</th>
                                    <th className="py-4 px-6">Cargo</th>
                                    <th className="py-4 px-6">Salario Base</th>
                                    <th className="py-4 px-6">Beneficios / Comisiones ($)</th>
                                    <th className="py-4 px-6">Vacaciones a Pagar ($)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {empleados.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">
                                            {emp.nombres} {emp.apellidos}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{emp.cargo}</td>
                                        <td className="py-4 px-6 font-mono font-medium">{formatMoneda(emp.salario_base)}</td>
                                        <td className="py-4 px-6">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={novedades[emp.id]?.beneficios || ''}
                                                onChange={(e) => handleNovedadChange(emp.id, 'beneficios', e.target.value)}
                                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                            />
                                        </td>
                                        <td className="py-4 px-6">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={novedades[emp.id]?.vacaciones || ''}
                                                onChange={(e) => handleNovedadChange(emp.id, 'vacaciones', e.target.value)}
                                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-blue-600"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 print:hidden">
                <button
                    type="button"
                    onClick={onBack}
                    className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading || loadingEmpleados}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Generando...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-play-fill"></i>
                            Procesar y Generar Planilla
                        </>
                    )}
                </button>
            </div>

        </form>
    );
};

/**
 * Pestaña con el listado principal de Planillas.
 */
const PlanillaListTab = ({ onVerDetalle, onGenerarClick }) => {
    const [planillasList, setPlanillasList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlanillas = async () => {
        setLoading(true);
        try {
            const response = await getPlanillas();
            if (response.status === 'success') {
                setPlanillasList(response.data);
            }
        } catch (error) {
            console.error('Error al cargar planillas:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar las planillas.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlanillas();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Eliminar planilla?',
            text: "Esta acción borrará la planilla y todas las boletas de pago asociadas permanentemente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ba1a1a',
            cancelButtonColor: '#00288e',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                const response = await deletePlanilla(id);
                if (response.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'La planilla y sus boletas se han eliminado con éxito.'
                    });
                    fetchPlanillas();
                }
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'No se pudo eliminar la planilla.'
                });
            }
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                <h3 className="font-bold text-md text-slate-800 dark:text-white m-0">Historial de Planillas</h3>
                <button
                    onClick={onGenerarClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                    <i className="bi bi-plus-lg"></i>
                    Nueva Planilla
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-slate-500 text-sm">Cargando historial...</p>
                </div>
            ) : planillasList.length === 0 ? (
                <div className="py-16 text-center">
                    <i className="bi bi-calculator text-5xl text-slate-300 dark:text-slate-700 block mb-3"></i>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No se han registrado planillas en el sistema.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6">ID Planilla</th>
                                <th className="py-4 px-6">Período de Nómina</th>
                                <th className="py-4 px-6">Frecuencia</th>
                                <th className="py-4 px-6">Fecha Creación</th>
                                <th className="py-4 px-6">Estado</th>
                                <th className="py-4 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {planillasList.map((p) => {
                                const esBorrador = p.estado === 'BORRADOR';
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-white">#{p.id}</td>
                                        <td className="py-4 px-6 font-semibold">
                                            {new Date(p.fecha_inicio + 'T00:00:00').toLocaleDateString()} al {new Date(p.fecha_fin + 'T00:00:00').toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{p.tipo_periodo}</td>
                                        <td className="py-4 px-6 text-slate-400 font-medium">{new Date(p.creado_en).toLocaleString()}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                esBorrador ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' : 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
                                            }`}>
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onVerDetalle(p.id)}
                                                    className="border border-blue-600 hover:bg-blue-50 text-blue-600 dark:border-white dark:text-white dark:hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                                >
                                                    <i className="bi bi-eye mr-1.5"></i>
                                                    Ver Detalle
                                                </button>
                                                {esBorrador && (
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="border border-red-600 hover:bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

/**
 * Componente Contenedor Principal de la sección de Planillas.
 */
const V2_ContenedorPlanilla = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list', 'generar', 'detalle'
    const [selectedPlanillaId, setSelectedPlanillaId] = useState(null);

    const handleVerDetalle = (id) => {
        setSelectedPlanillaId(id);
        setViewMode('detalle');
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedPlanillaId(null);
    };

    return (
        <div className="m-4 md:m-6 py-4 space-y-6 print:m-0 print:p-0">
            
            {/* Cabecera Principal (Oculta al imprimir boleta) */}
            <div className="flex flex-col items-center justify-center text-center print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-black tracking-tight dark:text-white">Planillas de Sueldos</h1>
                    <p className="text-slate-500 text-sm mt-2">Generación de nómina, aportes patronales de ley y emisión de boletas de pago.</p>
                </div>
            </div>

            {/* Contenido dinámico según el viewMode */}
            <div className="mt-6">
                {viewMode === 'list' && (
                    <PlanillaListTab
                        onVerDetalle={handleVerDetalle}
                        onGenerarClick={() => setViewMode('generar')}
                    />
                )}
                {viewMode === 'generar' && (
                    <PlanillaGenerarTab
                        onBack={handleBack}
                    />
                )}
                {viewMode === 'detalle' && (
                    <PlanillaDetalleView
                        planillaId={selectedPlanillaId}
                        onBack={handleBack}
                    />
                )}
            </div>
        </div>
    );
};

export default V2_ContenedorPlanilla;
