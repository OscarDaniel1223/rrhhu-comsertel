import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import { getPlanillas, getPlanillaById, generarPlanilla, cerrarPlanilla, deletePlanilla } from '../services/v2_planillaService';
import { getEmpleados } from '../services/v2_empleadoService';

/**
 * Procesa una fecha para evitar el desfase horario y los problemas de Invalid Date
 * cuando la fecha viene formateada como string ISO completo (con T y Z).
 */
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

    return createPortal(
        <div className="boleta-print-modal fixed inset-0 z-[1060] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto print:backdrop-blur-none">
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    /* Ocultar la aplicacion React entera y otros overlays */
                    #root, body > div:not(.boleta-print-modal) {
                        display: none !important;
                    }
                    /* Limpiar body y html para la impresion */
                    html, body {
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        color: black !important;
                    }
                    /* Ajustar contenedor del modal de impresion */
                    .boleta-print-modal {
                        display: block !important;
                        position: static !important;
                        width: 100% !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        color: black !important;
                    }
                    .boleta-print-modal * {
                        background: transparent !important;
                        color: black !important;
                        box-shadow: none !important;
                        text-shadow: none !important;
                    }
                    .print-hidden {
                        display: none !important;
                    }
                    @page {
                        size: letter;
                        margin: 10mm;
                    }
                }
            `}} />
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:h-full print:p-0">
                
                {/* Cabecera del Modal (Oculta al imprimir) */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 print-hidden bg-slate-50 dark:bg-slate-900/50 print:hidden">
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
                    <div className="border-2 border-slate-300 p-6 rounded-xl space-y-6 print:border print:border-slate-400 print:p-4 print:space-y-4 print:rounded-none">
                        
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
                                Período del {formatFechaLocal(planilla.fecha_inicio)} al {formatFechaLocal(planilla.fecha_fin)} ({planilla.tipo_periodo})
                            </p>
                        </div>

                        {/* Datos del Empleado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-2 text-sm bg-slate-50 dark:bg-slate-800/40 p-4 print:p-3 rounded-lg border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4 items-start">
                            
                            {/* Ingresos / Devengados */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                                    Ingresos y Devengados
                                </div>
                                <div className="p-4 print:p-3 space-y-2 print:space-y-1 text-sm">
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
                                <div className="p-4 print:p-3 space-y-2 print:space-y-1 text-sm">
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
                                    {Number(boleta.renta_retencion) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400">Impuesto sobre la Renta (Retención):</span>
                                            <span className="font-semibold text-red-600">-{formatMoneda(boleta.renta_retencion)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex justify-between font-bold text-slate-800 dark:text-white">
                                        <span>Total Retenciones:</span>
                                        <span>{formatMoneda(boleta.total_retenciones)}</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Neto a Recibir Líquido */}
                        <div className="flex flex-col md:flex-row print:flex-row items-center print:justify-between p-5 print:p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-900 dark:bg-slate-800/80 dark:border-slate-700/80 dark:text-white print:bg-white print:border-slate-300">
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
                            <div className="p-4 print:p-3 grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-2 text-xs">
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
                        <div className="grid grid-cols-2 gap-12 print:gap-6 pt-16 print:pt-8 text-center text-xs">
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
        </div>,
        document.body
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

    const handlePrintAll = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            Swal.fire({
                icon: 'warning',
                title: 'Bloqueador de ventanas emergentes',
                text: 'Por favor, permita las ventanas emergentes para poder imprimir todas las boletas de pago.'
            });
            return;
        }

        let boletasHTML = '';
        boletas.forEach((b) => {
            const totalDeducciones = parseFloat(b.isss_empleado) + parseFloat(b.afp_empleado) + parseFloat(b.renta) + (parseFloat(b.descuento_ausencias) || 0.0);
            const salarioProporcional = planilla.tipo_periodo === 'QUINCENAL' ? b.salario_base / 2.0 : b.salario_base;
            
            boletasHTML += `
                <div class="boleta-page" style="page-break-after: always; padding: 20px; font-family: sans-serif; color: black; background: white; max-width: 800px; margin: 0 auto;">
                    <div style="border: 2px solid #ccc; padding: 20px; border-radius: 8px;">
                        <div style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">
                            <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">COMSERTEL, S.A. DE C.V.</h2>
                            <p style="margin: 5px 0 0; font-size: 11px; text-transform: uppercase; color: #555; font-weight: bold;">Servicios de Conectividad y Telecomunicaciones</p>
                            <p style="margin: 2px 0 0; font-size: 11px; color: #777;">San Salvador, El Salvador</p>
                        </div>
                        
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h3 style="margin: 0; font-size: 14px; text-transform: uppercase; color: #333;">Boleta de Pago Individual</h3>
                            <p style="margin: 5px 0 0; font-size: 11px; color: #666;">
                                Período del ${formatFechaLocal(planilla.fecha_inicio)} al ${formatFechaLocal(planilla.fecha_fin)} (${planilla.tipo_periodo})
                            </p>
                        </div>
                        
                        <table style="width: 100%; font-size: 12px; background: #f9f9f9; padding: 12px; border-radius: 6px; border: 1px solid #eee; margin-bottom: 20px; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 4px; width: 50%;"><strong>Colaborador:</strong> ${b.nombres} ${b.apellidos}</td>
                                <td style="padding: 4px; width: 50%;"><strong>DUI:</strong> ${b.dui}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px;"><strong>Cargo:</strong> ${b.cargo}</td>
                                <td style="padding: 4px;"><strong>NIT:</strong> ${b.nit}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px;"><strong>Salario Base Mensual:</strong> ${formatMoneda(b.salario_base)}</td>
                                <td style="padding: 4px;"><strong>Días Cancelados:</strong> ${b.dias_trabajados} días</td>
                            </tr>
                        </table>
                        
                        <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px; font-size: 12px;">
                            <div style="width: 48%; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column;">
                                <div style="background: #eee; padding: 6px 12px; font-weight: bold; font-size: 11px; text-transform: uppercase;">Ingresos y Devengados</div>
                                <div style="padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                            <span>Salario Proporcional:</span>
                                            <span>${formatMoneda(salarioProporcional)}</span>
                                        </div>
                                        ${Number(b.beneficios) > 0 ? `
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                                <span>Beneficios / Bonos:</span>
                                                <span style="color: green;">+${formatMoneda(b.beneficios)}</span>
                                            </div>
                                        ` : ''}
                                        ${Number(b.vacaciones) > 0 ? `
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                                <span>Vacaciones Pagadas:</span>
                                                <span style="color: green;">+${formatMoneda(b.vacaciones)}</span>
                                            </div>
                                        ` : ''}
                                        ${Number(b.aguinaldo) > 0 ? `
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                                <span>Aguinaldo Exento:</span>
                                                <span style="color: green;">+${formatMoneda(b.aguinaldo)}</span>
                                            </div>
                                        ` : ''}
                                        ${Number(b.quincena_veinticinco) > 0 ? `
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                                <span>Quincena Veinticinco:</span>
                                                <span style="color: green;">+${formatMoneda(b.quincena_veinticinco)}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div style="border-top: 1px solid #eee; padding-top: 6px; margin-top: 6px; display: flex; justify-content: space-between; font-weight: bold;">
                                        <span>Total Devengado:</span>
                                        <span>${formatMoneda(b.salario_devengado)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="width: 48%; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; display: flex; flex-direction: column;">
                                <div style="background: #eee; padding: 6px 12px; font-weight: bold; font-size: 11px; text-transform: uppercase;">Descuentos y Deducciones</div>
                                <div style="padding: 12px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                                    <div>
                                        ${Number(b.descuento_ausencias) > 0 ? `
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                                <span>Descuento Ausencias:</span>
                                                <span style="color: red;">-${formatMoneda(b.descuento_ausencias)}</span>
                                            </div>
                                        ` : ''}
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                            <span>AFP Empleado (7.25%):</span>
                                            <span style="color: red;">-${formatMoneda(b.afp_empleado)}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                            <span>ISSS Empleado (3.00%):</span>
                                            <span style="color: red;">-${formatMoneda(b.isss_empleado)}</span>
                                        </div>
                                        ${Number(b.renta) > 0 ? `
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                                <span>Renta Retención:</span>
                                                <span style="color: red;">-${formatMoneda(b.renta)}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div style="border-top: 1px solid #eee; padding-top: 6px; margin-top: 6px; display: flex; justify-content: space-between; font-weight: bold;">
                                        <span>Total Retenciones:</span>
                                        <span>-${formatMoneda(totalDeducciones)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #ebf5ff; padding: 12px 15px; border-radius: 6px; border: 1px solid #cce5ff; margin-bottom: 20px; font-size: 14px;">
                            <div>
                                <span style="font-size: 10px; color: #555; text-transform: uppercase; font-weight: bold; display: block;">Líquido a Recibir</span>
                                <span style="font-size: 20px; font-weight: bold; font-family: monospace; color: #004085;">${formatMoneda(b.salario_neto)}</span>
                            </div>
                            <div style="font-size: 10px; color: #777; font-weight: 500;">
                                Monto en Dólares de los Estados Unidos de América
                            </div>
                        </div>
                        
                        <div style="border: 1px solid #ddd; border-radius: 6px; overflow: hidden; background: #fafafa; padding: 10px; font-size: 10px;">
                            <div style="font-weight: bold; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; text-transform: uppercase; color: #666;">Aportes Patronales (Costeo Empresa)</div>
                            <div style="display: flex; justify-content: space-between;">
                                <span><strong>AFP Patrono (8.75%):</strong> ${formatMoneda(b.afp_patrono)}</span>
                                <span><strong>ISSS Patrono (7.50%):</strong> ${formatMoneda(b.isss_patrono)}</span>
                                <span><strong>INCAF Patrono (1.00%):</strong> ${formatMoneda(b.insaforp_patrono)}</span>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-top: 50px; text-align: center; font-size: 10px; gap: 40px;">
                            <div style="flex: 1; border-top: 1px solid #000; padding-top: 5px;">
                                <strong style="font-size: 11px;">COMSERTEL, S.A. DE C.V.</strong><br>Firma y Sello del Patrono
                            </div>
                            <div style="flex: 1; border-top: 1px solid #000; padding-top: 5px;">
                                <strong style="font-size: 11px;">${b.nombres} ${b.apellidos}</strong><br>Firma de Conformidad Empleado
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Boletas de Pago - Periodo ${planilla.id}</title>
                    <style>
                        body { margin: 0; padding: 0; background: white; }
                        @media print {
                            body { background: white; }
                            .boleta-page { page-break-after: always; }
                            .boleta-page:last-child { page-break-after: avoid; }
                        }
                    </style>
                </head>
                <body>
                    ${boletasHTML}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleExportCSV = () => {
        const headers = [
            'Empleado',
            'Cargo',
            'DUI',
            'NIT',
            'Dias Trabajados',
            'Salario Base',
            'Salario Proporcional',
            'Beneficios/Comisiones',
            'Vacaciones',
            'Aguinaldo',
            'Quincena 25',
            'Salario Devengado',
            'Deduccion Ausencias',
            'ISSS Empleado',
            'AFP Empleado',
            'Renta',
            'Total Deducciones',
            'Salario Neto',
            'ISSS Patrono',
            'AFP Patrono',
            'INCAF Patrono'
        ];
        
        const rows = boletas.map((b) => {
            const totalDeducciones = parseFloat(b.isss_empleado) + parseFloat(b.afp_empleado) + parseFloat(b.renta) + (parseFloat(b.descuento_ausencias) || 0.0);
            const salarioProporcional = planilla.tipo_periodo === 'QUINCENAL' ? b.salario_base / 2.0 : b.salario_base;
            
            return [
                `"${b.nombres} ${b.apellidos}"`,
                `"${b.cargo}"`,
                `"${b.dui}"`,
                `"${b.nit}"`,
                b.dias_trabajados,
                b.salario_base,
                salarioProporcional.toFixed(2),
                b.beneficios,
                b.vacaciones,
                b.aguinaldo,
                b.quincena_veinticinco,
                b.salario_devengado,
                b.descuento_ausencias || '0.00',
                b.isss_empleado,
                b.afp_empleado,
                b.renta,
                totalDeducciones.toFixed(2),
                b.salario_neto,
                b.isss_patrono,
                b.afp_patrono,
                b.insaforp_patrono
            ];
        });
        
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += headers.join(",") + "\n";
        rows.forEach((rowArray) => {
            csvContent += rowArray.join(",") + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Planilla_${planilla.id}_Periodo_${planilla.fecha_inicio}_al_${planilla.fecha_fin}.csv`);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
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
                    <button
                        onClick={handlePrintAll}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <i className="bi bi-printer"></i>
                        Imprimir Boletas
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <i className="bi bi-file-earmark-spreadsheet"></i>
                        Exportar CSV
                    </button>
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
                    <p><span className="font-semibold text-slate-700 dark:text-white">Rango de fechas:</span> {formatFechaLocal(planilla.fecha_inicio)} al {formatFechaLocal(planilla.fecha_fin)}</p>
                    <p><span className="font-semibold text-slate-700 dark:text-white">Tipo de planilla:</span> {planilla.tipo_periodo}</p>
                    <p><span className="font-semibold text-slate-700 dark:text-white">Fecha Generación:</span> {new Date(planilla.creado_en).toLocaleString()}</p>
                </div>
            </div>

            {/* Consolidado Unificado de la Planilla */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 space-y-6 shadow-sm text-left">
                <h3 className="font-bold text-md text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 uppercase text-xs tracking-wider">
                    Consolidado General de Costos y Prestaciones (Periodo)
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
                    {/* Retenciones Empleados */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                            Deducciones de Colaboradores
                        </h4>
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

                    {/* Aportes Patronales */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                            Carga Social Patronal
                        </h4>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">ISSS Patronal (7.50%):</span>
                            <span className="font-mono font-semibold">{formatMoneda(resumen.total_isss_patrono)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">AFP Patronal (8.75%):</span>
                            <span className="font-mono font-semibold">{formatMoneda(resumen.total_afp_patrono)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">INCAF Capacitación (1.00%):</span>
                            <span className="font-mono font-semibold">{formatMoneda(resumen.total_insaforp_patrono)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-bold text-blue-600">
                            <span>Total Aportes Patronales:</span>
                            <span className="font-mono">{formatMoneda(resumen.total_aportes_patronales)}</span>
                        </div>
                    </div>

                    {/* Prestaciones Adicionales (Tarea 12) */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-50 dark:border-slate-800/50 pb-1.5">
                            Prestaciones e Ingresos Adicionales
                        </h4>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Beneficios / Comisiones:</span>
                            <span className="font-mono font-semibold text-emerald-600">+{formatMoneda(resumen.total_beneficios)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Vacaciones a Pagar:</span>
                            <span className="font-mono font-semibold text-emerald-600">+{formatMoneda(resumen.total_vacaciones)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Aguinaldos de Ley:</span>
                            <span className="font-mono font-semibold text-emerald-600">+{formatMoneda(resumen.total_aguinaldo)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Quincena Veinticinco:</span>
                            <span className="font-mono font-semibold text-emerald-600">+{formatMoneda(resumen.total_quincena_veinticinco)}</span>
                        </div>
                    </div>
                </div>

                {/* Coste Total Patronal Resumido */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 rounded-xl">
                    <div className="text-left">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Resumen del Periodo</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Salarios Devengados ({formatMoneda(resumen.total_salarios_devengados)}) + Carga Social ({formatMoneda(resumen.total_aportes_patronales)})
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider block">Coste Total Patronal</span>
                        <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">{formatMoneda(resumen.total_costo_patronal)}</span>
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
                            
                            {/* Fila de Totales de la Tabla (Tarea 13) */}
                            <tr className="bg-slate-50/80 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                                <td className="py-4 px-6" colSpan="3">Totales de la Planilla</td>
                                <td className="py-4 px-6 text-right font-mono">{formatMoneda(resumen.total_salarios_devengados)}</td>
                                <td className="py-4 px-6 text-right font-mono text-red-500">-{formatMoneda(resumen.total_isss_empleado + resumen.total_afp_empleado + resumen.total_renta)}</td>
                                <td className="py-4 px-6 text-right font-mono text-emerald-600">{formatMoneda(resumen.total_salarios_netos)}</td>
                                <td className="py-4 px-6"></td>
                            </tr>
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

    // Obtener mes actual y siguiente basados en la fecha del sistema
    const hoy = new Date();
    const mesActualIndex = hoy.getMonth(); // 0 a 11
    const anioActual = hoy.getFullYear();

    const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const opcionMesActual = {
        valor: `${anioActual}-${String(mesActualIndex + 1).padStart(2, '0')}`,
        label: `${nombresMeses[mesActualIndex]} ${anioActual} (Mes Actual)`
    };

    const siguienteMesIndex = (mesActualIndex + 1) % 12;
    const siguienteAnio = mesActualIndex === 11 ? anioActual + 1 : anioActual;
    const opcionMesSiguiente = {
        valor: `${siguienteAnio}-${String(siguienteMesIndex + 1).padStart(2, '0')}`,
        label: `${nombresMeses[siguienteMesIndex]} ${siguienteAnio} (Mes Siguiente)`
    };

    const [mesSeleccionado, setMesSeleccionado] = useState(opcionMesActual.valor);
    const [quincenaSeleccionada, setQuincenaSeleccionada] = useState('1'); // '1' o '2', solo se usa si tipoPeriodo === 'QUINCENAL'

    const [empleados, setEmpleados] = useState([]);
    const [novedades, setNovedades] = useState({}); // { [id_empleado]: { beneficios: number, vacaciones: number } }
    const [loading, setLoading] = useState(false);
    const [loadingEmpleados, setLoadingEmpleados] = useState(true);

    // Actualizar automáticamente fechaInicio y fechaFin al cambiar los parámetros del período
    useEffect(() => {
        if (!mesSeleccionado) return;
        
        const [anioStr, mesStr] = mesSeleccionado.split('-');
        const anio = parseInt(anioStr, 10);
        const mes = parseInt(mesStr, 10); // 1 a 12

        if (tipoPeriodo === 'MENSUAL') {
            const inicio = `${anioStr}-${mesStr}-01`;
            const ultimoDia = new Date(anio, mes, 0).getDate();
            const fin = `${anioStr}-${mesStr}-${String(ultimoDia).padStart(2, '0')}`;
            
            setFechaInicio(inicio);
            setFechaFin(fin);
        } else if (tipoPeriodo === 'QUINCENAL') {
            if (quincenaSeleccionada === '1') {
                const inicio = `${anioStr}-${mesStr}-01`;
                const fin = `${anioStr}-${mesStr}-15`;
                setFechaInicio(inicio);
                setFechaFin(fin);
            } else {
                const inicio = `${anioStr}-${mesStr}-16`;
                const ultimoDia = new Date(anio, mes, 0).getDate();
                const fin = `${anioStr}-${mesStr}-${String(ultimoDia).padStart(2, '0')}`;
                setFechaInicio(inicio);
                setFechaFin(fin);
            }
        }
    }, [tipoPeriodo, mesSeleccionado, quincenaSeleccionada]);

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
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mes a Generar</label>
                        <select
                            value={mesSeleccionado}
                            onChange={(e) => setMesSeleccionado(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        >
                            <option value={opcionMesActual.valor}>{opcionMesActual.label}</option>
                            <option value={opcionMesSiguiente.valor}>{opcionMesSiguiente.label}</option>
                        </select>
                    </div>

                    {tipoPeriodo === 'QUINCENAL' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Período Quincenal</label>
                            <select
                                value={quincenaSeleccionada}
                                onChange={(e) => setQuincenaSeleccionada(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                            >
                                <option value="1">Primera Quincena (Días 1 - 15)</option>
                                <option value="2">Segunda Quincena (Días 16 - Fin)</option>
                            </select>
                        </div>
                    )}
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

const getNumeroPlanilla = (p) => {
    const fecha = parseFechaLocal(p.fecha_inicio);
    if (!fecha) return '';
    const mes = fecha.getMonth() + 1; // 1 a 12
    if (p.tipo_periodo === 'MENSUAL') {
        return mes; // 1 al 12
    } else if (p.tipo_periodo === 'QUINCENAL') {
        const dia = fecha.getDate();
        if (dia <= 15) {
            return (mes - 1) * 2 + 1; // 1 al 23 (impares)
        } else {
            return (mes - 1) * 2 + 2; // 2 al 24 (pares)
        }
    }
    return '';
};

/**
 * Pestaña con el listado principal de Planillas.
 */
const PlanillaListTab = ({ onVerDetalle }) => {
    const [planillasList, setPlanillasList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroFrecuencia, setFiltroFrecuencia] = useState('TODOS');
    const [filtroAno, setFiltroAno] = useState('TODOS');
    const [filtroMes, setFiltroMes] = useState('TODOS');

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

    const anosDisponibles = Array.from(
        new Set(
            planillasList
                .map((p) => {
                    const d = parseFechaLocal(p.fecha_inicio);
                    return d ? d.getFullYear().toString() : null;
                })
                .filter(Boolean)
        )
    ).sort((a, b) => b - a);

    if (anosDisponibles.length === 0) {
        anosDisponibles.push(new Date().getFullYear().toString());
    }

    const planillasFiltradas = planillasList.filter((p) => {
        if (filtroFrecuencia !== 'TODOS' && p.tipo_periodo !== filtroFrecuencia) return false;
        
        const fecha = parseFechaLocal(p.fecha_inicio);
        if (!fecha) return false;

        const ano = fecha.getFullYear().toString();
        if (filtroAno !== 'TODOS' && ano !== filtroAno) return false;

        const mes = (fecha.getMonth() + 1).toString();
        if (filtroMes !== 'TODOS' && mes !== filtroMes) return false;

        return true;
    });

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
                <h3 className="font-bold text-md text-slate-800 dark:text-white m-0">Historial de Planillas</h3>
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Frecuencia:</label>
                        <select
                            value={filtroFrecuencia}
                            onChange={(e) => setFiltroFrecuencia(e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-100 transition-colors"
                        >
                            <option value="TODOS">Todas</option>
                            <option value="QUINCENAL">Quincenales</option>
                            <option value="MENSUAL">Mensuales</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Año:</label>
                        <select
                            value={filtroAno}
                            onChange={(e) => setFiltroAno(e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-100 transition-colors"
                        >
                            <option value="TODOS">Todos</option>
                            {anosDisponibles.map((ano) => (
                                <option key={ano} value={ano}>{ano}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Mes:</label>
                        <select
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(e.target.value)}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-100 transition-colors"
                        >
                            <option value="TODOS">Todos</option>
                            <option value="1">Enero</option>
                            <option value="2">Febrero</option>
                            <option value="3">Marzo</option>
                            <option value="4">Abril</option>
                            <option value="5">Mayo</option>
                            <option value="6">Junio</option>
                            <option value="7">Julio</option>
                            <option value="8">Agosto</option>
                            <option value="9">Septiembre</option>
                            <option value="10">Octubre</option>
                            <option value="11">Noviembre</option>
                            <option value="12">Diciembre</option>
                        </select>
                    </div>
                </div>
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
            ) : planillasFiltradas.length === 0 ? (
                <div className="py-16 text-center">
                    <i className="bi bi-funnel text-5xl text-slate-300 dark:text-slate-700 block mb-3"></i>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No se encontraron planillas con la frecuencia seleccionada.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                <th className="py-4 px-6">Nº Planilla</th>
                                <th className="py-4 px-6">Período de Nómina</th>
                                <th className="py-4 px-6">Frecuencia</th>
                                <th className="py-4 px-6">Fecha Creación</th>
                                <th className="py-4 px-6">Estado</th>
                                <th className="py-4 px-6 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {planillasFiltradas.map((p) => {
                                const esBorrador = p.estado === 'BORRADOR';
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-white">#{getNumeroPlanilla(p)}</td>
                                        <td className="py-4 px-6 font-semibold">
                                            {formatFechaLocal(p.fecha_inicio)} al {formatFechaLocal(p.fecha_fin)}
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

            {/* Tabs Navigation (Oculta al ver detalle o imprimir) */}
            {viewMode !== 'detalle' && (
                <div className="mb-8 flex justify-center print:hidden">
                    <nav className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[15px]" aria-label="Tabs">
                        <button
                            onClick={() => {
                                setViewMode('list');
                                setSelectedPlanillaId(null);
                            }}
                            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 cursor-pointer flex items-center ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <i className="bi bi-clock-history me-2"></i>
                            Historial de Planillas
                        </button>
                        
                        <button
                            onClick={() => {
                                setViewMode('generar');
                                setSelectedPlanillaId(null);
                            }}
                            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 cursor-pointer flex items-center ${
                                viewMode === 'generar'
                                    ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Generar Planilla
                        </button>
                    </nav>
                </div>
            )}

            {/* Contenido dinámico según el viewMode */}
            <div className="mt-6">
                {viewMode === 'list' && (
                    <PlanillaListTab
                        onVerDetalle={handleVerDetalle}
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
