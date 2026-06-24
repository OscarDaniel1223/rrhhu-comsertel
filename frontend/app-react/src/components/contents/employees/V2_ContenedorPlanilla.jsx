import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import { getPlanillas, getPlanillaById, generarPlanilla, cerrarPlanilla, deletePlanilla } from '../../../services/employees/v2_planillaService';
import { getEmpleados } from '../../../services/employees/v2_empleadoService';
import { getNovedadesPorRango } from '../../../services/employees/v2_novedadesService';



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
 * Calcula el aguinaldo anual de ley (Art. 196-198 Código de Trabajo de El Salvador) para la UI.
 */
const calcularAguinaldoFrontend = (salarioBase, fechaIngreso, fechaCalculoInput) => {
    const fIngreso = parseFechaLocal(fechaIngreso);
    let fCalculo = parseFechaLocal(fechaCalculoInput || new Date());
    if (!fIngreso || !fCalculo) return 0.00;

    const anioCalculo = fCalculo.getFullYear();
    const fechaAcreditacion = new Date(anioCalculo, 9, 20); // 20 de Octubre

    if (fCalculo >= fechaAcreditacion) {
        fCalculo = fechaAcreditacion;
    }

    const diffTime = fCalculo.getTime() - fIngreso.getTime();
    if (diffTime < 0) return 0.00;

    const diasAntiguedad = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const aniosAntiguedad = diasAntiguedad / 365.25;

    const salarioDia = parseFloat(salarioBase) / 30.0;

    if (aniosAntiguedad < 1.0) {
        const diasProporcionalesAguinaldo = (diasAntiguedad / 365.0) * 15.0;
        const aguinaldoProporcional = diasProporcionalesAguinaldo * salarioDia;
        return Math.round(aguinaldoProporcional * 100) / 100;
    } else if (aniosAntiguedad < 3.0) {
        return Math.round((salarioDia * 15.0) * 100) / 100;
    } else if (aniosAntiguedad < 10.0) {
        return Math.round((salarioDia * 19.0) * 100) / 100;
    } else {
        return Math.round((salarioDia * 21.0) * 100) / 100;
    }
};

/**
 * Modal para visualizar e imprimir la boleta de pago individual del empleado.
 */
const BoletaPagoModal = ({ boleta, planilla, onClose }) => {
    if (!boleta) return null;

    const handlePrint = () => {
        window.print();
    };

    const salarioBaseMensual = parseFloat(boleta.salario_base) || 0;
    const esQuincenal = planilla.tipo_periodo === 'QUINCENAL';
    const salarioProporcional = esQuincenal ? (salarioBaseMensual / 2.0) : salarioBaseMensual;

    const horasExtrasDiurnas = parseFloat(boleta.horas_extras_diurnas) || 0;
    const horasExtrasNocturnas = parseFloat(boleta.horas_extras_nocturnas) || 0;
    const viaticos = parseFloat(boleta.viaticos) || 0;
    const beneficios = parseFloat(boleta.beneficios) || 0;
    const vacaciones = parseFloat(boleta.vacaciones) || 0;
    const aguinaldo = parseFloat(boleta.aguinaldo) || 0;
    const quincenaVeinticinco = parseFloat(boleta.quincena_veinticinco) || 0;

    // Total Devengado Bruto
    const totalDevengadoBruto = salarioProporcional + horasExtrasDiurnas + horasExtrasNocturnas + viaticos + beneficios + vacaciones + aguinaldo + quincenaVeinticinco;

    const descuentoAusencias = parseFloat(boleta.descuento_ausencias) || 0;
    const afpEmpleado = parseFloat(boleta.afp_empleado) || 0;
    const isssEmpleado = parseFloat(boleta.isss_empleado) || 0;
    const rentaEmpleado = parseFloat(boleta.renta) || 0;

    // Total Deducciones
    const totalDeducciones = descuentoAusencias + afpEmpleado + isssEmpleado + rentaEmpleado;
    const salarioNeto = parseFloat(boleta.salario_neto) || 0;

    // Convertir número a palabras en español
    const numeroALetras = (num) => {
        const pesos = Math.floor(num);
        const centavos = Math.round((num - pesos) * 100);
        
        const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
        const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
        const especiales = {
            11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
            16: "DIECISEIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
            21: "VEINTIUN", 22: "VEINTIDOS", 23: "VEINTITRES", 24: "VEINTICUATRO",
            25: "VEINTICINCO", 26: "VEINTISEIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
        };
        const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

        const convertirGrupo = (n) => {
            let output = "";
            const c = Math.floor(n / 100);
            const d = Math.floor((n % 100) / 10);
            const u = n % 10;

            if (c > 0) {
                if (c === 1 && d === 0 && u === 0) output += "CIEN ";
                else output += centenas[c] + " ";
            }

            const du = d * 10 + u;
            if (du > 0) {
                if (du < 10) output += unidades[du] + " ";
                else if (du >= 11 && du <= 29 && especiales[du]) output += especiales[du] + " ";
                else {
                    output += decenas[d] + " ";
                    if (u > 0) output += "Y " + unidades[u] + " ";
                }
            }
            return output.trim();
        };

        if (num === 0) return "CERO DOLARES CON 00/100 USD";

        let text = "";
        const miles = Math.floor(pesos / 1000);
        const resto = pesos % 1000;

        if (miles > 0) {
            if (miles === 1) text += "MIL ";
            else text += convertirGrupo(miles) + " MIL ";
        }

        if (resto > 0) {
            text += convertirGrupo(resto) + " ";
        }

        const centavosStr = centavos.toString().padStart(2, "0");
        return `${text.trim()} DOLARES CON ${centavosStr}/100 USD`;
    };

    const netoLetras = numeroALetras(salarioNeto);

    // Lógica dinámica de fechas y leyendas legales
    const fInicioPlanilla = parseFechaLocal(planilla.fecha_inicio);
    const anioPlanilla = fInicioPlanilla ? fInicioPlanilla.getFullYear() : new Date().getFullYear();

    let subtituloFecha = `Período del ${formatFechaLocal(planilla.fecha_inicio)} al ${formatFechaLocal(planilla.fecha_fin)} (${planilla.tipo_periodo})`;
    let leyendaExplicativa = null;

    if (quincenaVeinticinco > 0) {
        subtituloFecha = `Quincena Veinticinco - Fecha de Pago: 25/01/${anioPlanilla}`;
        leyendaExplicativa = `Este rango de fecha corresponde al pago del beneficio extraordinario de Quincena Veinticinco (aplicado al 25 de Enero de ${anioPlanilla}), conforme a las políticas laborales y acuerdos contractuales de COMSERTEL, S.A. DE C.V.`;
    } else if (aguinaldo > 0) {
        const fechaAguinaldoFormateada = boleta.fecha_aguinaldo ? formatFechaLocal(boleta.fecha_aguinaldo) : `Diciembre de ${anioPlanilla}`;
        subtituloFecha = `Aguinaldo de Ley - Fecha de Pago: ${fechaAguinaldoFormateada}`;
        leyendaExplicativa = `Este rango de fecha corresponde al pago del Aguinaldo de Ley de conformidad con los artículos 196 al 202 del Código de Trabajo de El Salvador. El pago ha sido programado y asignado de manera individual en la fecha de goce comprendida del 20 de Octubre al 20 de Diciembre de ${anioPlanilla}.`;
    }

    return createPortal(
        <div className="boleta-print-modal fixed inset-0 z-[1060] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:inset-auto print:backdrop-blur-none">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    #root, body > div:not(.boleta-print-modal) {
                        display: none !important;
                    }
                    html, body {
                        height: auto !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        color: black !important;
                    }
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

                {/* Cabecera del Modal */}
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

                {/* Contenido de la Boleta */}
                <div className="p-8 overflow-y-auto print:overflow-visible print:p-0 flex-1 bg-white text-black dark:bg-slate-900 dark:text-white print:bg-white print:text-black">
                    <div className="border-2 border-slate-300 p-6 rounded-xl space-y-6 print:border print:border-slate-400 print:p-4 print:space-y-4 print:rounded-none">

                        {/* Membrete */}
                        <div className="text-center pb-4 border-b border-slate-200 print:border-slate-300">
                            <h2 className="text-2xl font-bold uppercase tracking-wider text-slate-950 dark:text-white print:text-black">COMSERTEL, S.A. DE C.V.</h2>
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Servicios de Conectividad y Telecomunicaciones</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">San Salvador, El Salvador</p>
                        </div>

                        {/* Título */}
                        <div className="text-center">
                            <h3 className="text-md font-bold uppercase text-slate-800 dark:text-slate-200 print:text-slate-800">Boleta de Pago Individual</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {subtituloFecha}
                            </p>
                        </div>

                        {/* Datos del Empleado */}
                        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-2 text-sm bg-slate-50 dark:bg-slate-800/40 p-4 print:p-3 rounded-lg border border-slate-200 dark:border-slate-800 print:bg-white print:border-slate-300">
                            <div>
                                <p className="mb-2"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">Colaborador</span> <span className="font-semibold text-slate-900 dark:text-white print:text-black">{boleta.nombres} {boleta.apellidos}</span></p>
                                <p className="mb-2"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">Cargo / Área</span> <span className="font-semibold text-slate-900 dark:text-white print:text-black">{boleta.cargo} ({boleta.area || 'Back Office'})</span></p>
                                <p className="mb-0"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">Salario Base Mensual</span> <span className="font-semibold text-slate-900 dark:text-white print:text-black">{formatMoneda(boleta.salario_base)}</span></p>
                            </div>
                            <div>
                                <p className="mb-2"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">DUI / NIT</span> <span className="font-semibold text-slate-900 dark:text-white print:text-black">{boleta.dui || 'N/A'} / {boleta.nit || 'N/A'}</span></p>
                                <p className="mb-2"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">Días Cancelados</span> <span className="font-semibold text-slate-900 dark:text-white print:text-black">{boleta.dias_trabajados} días</span></p>
                                <p className="mb-0"><span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider block">Fecha Ingreso</span> <span className="font-semibold text-slate-900 dark:text-white print:text-black">{formatFechaLocal(boleta.fecha_ingreso)}</span></p>
                            </div>
                        </div>

                        {/* Detalle Financiero */}
                        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 print:gap-4 items-stretch">
                            {/* Ingresos / Devengados */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col justify-between print:border-slate-300">
                                <div>
                                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 print:bg-slate-100 print:text-slate-700">
                                        Ingresos y Devengados
                                    </div>
                                    <div className="p-4 print:p-3 space-y-2 print:space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Salario Proporcional:</span>
                                            <span className="font-semibold text-slate-900 dark:text-white print:text-black">{formatMoneda(salarioProporcional)}</span>
                                        </div>
                                        {horasExtrasDiurnas > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Horas Extras Diurnas:</span>
                                                <span className="font-semibold text-emerald-600">+{formatMoneda(horasExtrasDiurnas)}</span>
                                            </div>
                                        )}
                                        {horasExtrasNocturnas > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Horas Extras Nocturnas:</span>
                                                <span className="font-semibold text-emerald-600">+{formatMoneda(horasExtrasNocturnas)}</span>
                                            </div>
                                        )}
                                        {viaticos > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Viáticos (Exentos):</span>
                                                <span className="font-semibold text-emerald-600">+{formatMoneda(viaticos)}</span>
                                            </div>
                                        )}
                                        {beneficios > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Beneficios / Bonos:</span>
                                                <span className="font-semibold text-emerald-600">+{formatMoneda(beneficios)}</span>
                                            </div>
                                        )}
                                        {vacaciones > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Vacaciones Pagadas:</span>
                                                <span className="font-semibold text-emerald-600">+{formatMoneda(vacaciones)}</span>
                                            </div>
                                        )}
                                        {aguinaldo > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Aguinaldo Exento:</span>
                                                <span className="font-semibold text-emerald-600">+{formatMoneda(aguinaldo)}</span>
                                            </div>
                                        )}
                                        {quincenaVeinticinco > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Quincena Veinticinco:</span>
                                                <span className="font-semibold text-emerald-600">+{formatMoneda(quincenaVeinticinco)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-4 print:p-3 flex justify-between font-bold text-slate-800 dark:text-white print:bg-white print:border-slate-300">
                                    <span>Total Devengado Bruto:</span>
                                    <span className="font-mono">{formatMoneda(totalDevengadoBruto)}</span>
                                </div>
                            </div>

                            {/* Deducciones */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col justify-between print:border-slate-300">
                                <div>
                                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 print:bg-slate-100 print:text-slate-700">
                                        Descuentos y Deducciones
                                    </div>
                                    <div className="p-4 print:p-3 space-y-2 print:space-y-1 text-sm">
                                        {descuentoAusencias > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Descuento Ausencias:</span>
                                                <span className="font-semibold text-red-600">-{formatMoneda(descuentoAusencias)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Cotización Previsional AFP (7.25%):</span>
                                            <span className="font-semibold text-red-600">-{formatMoneda(afpEmpleado)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Seguro Social ISSS (3.00%):</span>
                                            <span className="font-semibold text-red-600">-{formatMoneda(isssEmpleado)}</span>
                                        </div>
                                        {rentaEmpleado > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400 print:text-slate-600">Retención de Renta (ISR):</span>
                                                <span className="font-semibold text-red-600">-{formatMoneda(rentaEmpleado)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 p-4 print:p-3 flex justify-between font-bold text-slate-800 dark:text-white print:bg-white print:border-slate-300">
                                    <span>Total Retenciones:</span>
                                    <span className="font-mono">{formatMoneda(totalDeducciones)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Neto a Recibir */}
                        <div className="flex flex-col md:flex-row print:flex-row items-center print:justify-between p-5 print:p-3 bg-blue-50/70 dark:bg-slate-850 border border-blue-100 dark:border-slate-800 rounded-lg text-blue-900 dark:text-white print:bg-white print:border-slate-300">
                            <div>
                                <span className="font-bold text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 block">Líquido a Recibir</span>
                                <span className="text-3xl font-mono font-bold tracking-tight text-blue-700 dark:text-blue-400 print:text-black">{formatMoneda(salarioNeto)}</span>
                            </div>
                            <div className="text-xs text-center md:text-right mt-3 md:mt-0 font-medium text-slate-500 dark:text-slate-400 max-w-[400px]">
                                {netoLetras}
                            </div>
                        </div>

                        {/* Leyenda Explicativa Legal */}
                        {leyendaExplicativa && (
                            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3.5 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 italic leading-normal">
                                <i className="bi bi-info-circle-fill mr-1.5 text-blue-600 dark:text-blue-400 align-middle"></i>
                                {leyendaExplicativa}
                            </div>
                        )}

                        {/* Costeo Empresa */}
                        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/40 print:bg-white print:border-slate-300">
                            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 print:bg-slate-100 print:text-slate-700">
                                Información de Aportes Patronales (Costeo Empresa)
                            </div>
                            <div className="p-4 print:p-3 grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-2 text-xs">
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider">AFP Patrono (8.75%)</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm print:text-black">{formatMoneda(boleta.afp_patrono)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider">ISSS Patrono (7.50%)</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm print:text-black">{formatMoneda(boleta.isss_patrono)}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block font-semibold uppercase tracking-wider">INCAF Patrono (1.00%)</span>
                                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm print:text-black">{formatMoneda(boleta.insaforp_patrono)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Firmas */}
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
    const [searchTerm, setSearchTerm] = useState('');
    const [areaFilter, setAreaFilter] = useState('');

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
                const mesIngresoNum = fechaIngresoDate ? (fechaIngresoDate.getMonth() + 1) : 0;
                
                // Monto de vacaciones general: Salario base / 2 * 30%
                montoVacaciones = (sueldoSalario / 2.0) * 0.30;

                if (mesIngresoNum === 12) {
                    if (tiempoAnios >= 5.0) {
                        boniVacaciones = (sueldoSalario / 2.0) * 0.20;
                    } else if (tiempoAnios >= 2.0 && tiempoAnios < 5.0) {
                        boniVacaciones = (sueldoSalario / 2.0) * 0.15;
                    } else {
                        boniVacaciones = 0.0;
                    }
                } else {
                    boniVacaciones = 0.0;
                }

                // Ajuste para consistencia con montos proporcionales
                const checkSuma = parseFloat((montoVacaciones + boniVacaciones).toFixed(2));
                if (Math.abs(vacacionesTotal - checkSuma) > 0.05 && boniVacaciones === 0) {
                    montoVacaciones = vacacionesTotal;
                }
            }

            // Monto Cotizable
            const salarioDevengado = parseFloat(b.salario_devengado) || 0.0;
            const aguinaldo = parseFloat(b.aguinaldo) || 0.0;
            const quincenaVeinticinco = parseFloat(b.quincena_veinticinco) || 0.0;
            const viaticos = parseFloat(b.viaticos) || 0.0;
            const montoCotizable = Math.max(0, salarioDevengado - aguinaldo - quincenaVeinticinco - viaticos);

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
                mesIngreso: fechaIngresoDate ? String(fechaIngresoDate.getMonth() + 1).padStart(2, '0') : '',
                tiempoEmpresaAnios: Math.round(tiempoAnios),
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
            const salarioBaseMensual = parseFloat(b.salario_base) || 0;
            const esQuincenal = planilla.tipo_periodo === 'QUINCENAL';
            const salarioProporcional = esQuincenal ? (salarioBaseMensual / 2.0) : salarioBaseMensual;

            const horasExtrasDiurnas = parseFloat(b.horas_extras_diurnas) || 0;
            const horasExtrasNocturnas = parseFloat(b.horas_extras_nocturnas) || 0;
            const viaticos = parseFloat(b.viaticos) || 0;
            const beneficios = parseFloat(b.beneficios) || 0;
            const vacaciones = parseFloat(b.vacaciones) || 0;
            const aguinaldo = parseFloat(b.aguinaldo) || 0;
            const quincenaVeinticinco = parseFloat(b.quincena_veinticinco) || 0;

            // Total Devengado Bruto
            const totalDevengadoBruto = salarioProporcional + horasExtrasDiurnas + horasExtrasNocturnas + viaticos + beneficios + vacaciones + aguinaldo + quincenaVeinticinco;

            const descuentoAusencias = parseFloat(b.descuento_ausencias) || 0;
            const afpEmpleado = parseFloat(b.afp_empleado) || 0;
            const isssEmpleado = parseFloat(b.isss_empleado) || 0;
            const rentaEmpleado = parseFloat(b.renta) || 0;

            // Total Deducciones
            const totalDeducciones = descuentoAusencias + afpEmpleado + isssEmpleado + rentaEmpleado;
            const salarioNeto = parseFloat(b.salario_neto) || 0;

            // Convertir número a palabras
            const numeroALetras = (num) => {
                const pesos = Math.floor(num);
                const centavos = Math.round((num - pesos) * 100);
                
                const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
                const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
                const especiales = {
                    11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
                    16: "DIECISEIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
                    21: "VEINTIUN", 22: "VEINTIDOS", 23: "VEINTITRES", 24: "VEINTICUATRO",
                    25: "VEINTICINCO", 26: "VEINTISEIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
                };
                const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

                const convertirGrupo = (n) => {
                    let output = "";
                    const c = Math.floor(n / 100);
                    const d = Math.floor((n % 100) / 10);
                    const u = n % 10;

                    if (c > 0) {
                        if (c === 1 && d === 0 && u === 0) output += "CIEN ";
                        else output += centenas[c] + " ";
                    }

                    const du = d * 10 + u;
                    if (du > 0) {
                        if (du < 10) output += unidades[du] + " ";
                        else if (du >= 11 && du <= 29 && especiales[du]) output += especiales[du] + " ";
                        else {
                            output += decenas[d] + " ";
                            if (u > 0) output += "Y " + unidades[u] + " ";
                        }
                    }
                    return output.trim();
                };

                if (num === 0) return "CERO DOLARES CON 00/100 USD";

                let text = "";
                const miles = Math.floor(pesos / 1000);
                const resto = pesos % 1000;

                if (miles > 0) {
                    if (miles === 1) text += "MIL ";
                    else text += convertirGrupo(miles) + " MIL ";
                }

                if (resto > 0) {
                    text += convertirGrupo(resto) + " ";
                }

                const centavosStr = centavos.toString().padStart(2, "0");
                return `${text.trim()} DOLARES CON ${centavosStr}/100 USD`;
            };

            const netoLetras = numeroALetras(salarioNeto);

            // Lógica dinámica de fechas y leyendas legales para la impresión
            const fInicioPlanilla = parseFechaLocal(planilla.fecha_inicio);
            const anioPlanilla = fInicioPlanilla ? fInicioPlanilla.getFullYear() : new Date().getFullYear();

            let subtituloFecha = `Período del ${formatFechaLocal(planilla.fecha_inicio)} al ${formatFechaLocal(planilla.fecha_fin)} (${planilla.tipo_periodo})`;
            let leyendaExplicativa = null;

            if (quincenaVeinticinco > 0) {
                subtituloFecha = `Quincena Veinticinco - Fecha de Pago: 25/01/${anioPlanilla}`;
                leyendaExplicativa = `Este rango de fecha corresponde al pago del beneficio extraordinario de Quincena Veinticinco (aplicado al 25 de Enero de ${anioPlanilla}), conforme a las políticas laborales y acuerdos contractuales de COMSERTEL, S.A. DE C.V.`;
            } else if (aguinaldo > 0) {
                const fechaAguinaldoFormateada = b.fecha_aguinaldo ? formatFechaLocal(b.fecha_aguinaldo) : `Diciembre de ${anioPlanilla}`;
                subtituloFecha = `Aguinaldo de Ley - Fecha de Pago: ${fechaAguinaldoFormateada}`;
                leyendaExplicativa = `Este rango de fecha corresponde al pago del Aguinaldo de Ley de conformidad con los artículos 196 al 202 del Código de Trabajo de El Salvador. El pago ha sido programado y asignado de manera individual en la fecha de goce comprendida del 20 de Octubre al 20 de Diciembre de ${anioPlanilla}.`;
            }

            boletasHTML += `
                <div class="boleta-page">
                    <div class="boleta-container">
                        <!-- Membrete -->
                        <div class="membrete">
                            <h2>COMSERTEL, S.A. DE C.V.</h2>
                            <p class="subtitulo">Servicios de Conectividad y Telecomunicaciones</p>
                            <p class="ubicacion">San Salvador, El Salvador</p>
                        </div>

                        <!-- Título -->
                        <div class="titulo-boleta">
                            <h3>Boleta de Pago Individual</h3>
                            <p class="periodo">${subtituloFecha}</p>
                        </div>

                        <!-- Datos Empleado -->
                        <div class="datos-empleado">
                            <div class="col">
                                <p><span class="label">Colaborador</span> <span class="valor-destacado">${b.nombres} ${b.apellidos}</span></p>
                                <p><span class="label">Cargo / Área</span> ${b.cargo} (${b.area || 'Back Office'})</p>
                                <p><span class="label">Salario Base Mensual</span> ${formatMoneda(b.salario_base)}</p>
                            </div>
                            <div class="col">
                                <p><span class="label">DUI / NIT</span> ${b.dui || 'N/A'} / ${b.nit || 'N/A'}</p>
                                <p><span class="label">Días Cancelados</span> ${b.dias_trabajados} días</p>
                                <p><span class="label">Fecha Ingreso</span> ${formatFechaLocal(b.fecha_ingreso)}</p>
                            </div>
                        </div>

                        <!-- Detalles Financieros -->
                        <div class="detalles-financieros">
                            <!-- Ingresos -->
                            <div class="col-detalle">
                                <div class="col-cabecera">Ingresos y Devengados</div>
                                <div class="col-cuerpo">
                                    <div class="fila-valor">
                                        <span>Salario Proporcional:</span>
                                        <span class="monto-valor">${formatMoneda(salarioProporcional)}</span>
                                    </div>
                                    ${horasExtrasDiurnas > 0 ? `
                                        <div class="fila-valor">
                                            <span>Horas Extras Diurnas:</span>
                                            <span class="monto-valor positivo">+${formatMoneda(horasExtrasDiurnas)}</span>
                                        </div>
                                    ` : ''}
                                    ${horasExtrasNocturnas > 0 ? `
                                        <div class="fila-valor">
                                            <span>Horas Extras Nocturnas:</span>
                                            <span class="monto-valor positivo">+${formatMoneda(horasExtrasNocturnas)}</span>
                                        </div>
                                    ` : ''}
                                    ${viaticos > 0 ? `
                                        <div class="fila-valor">
                                            <span>Viáticos (Exentos):</span>
                                            <span class="monto-valor positivo">+${formatMoneda(viaticos)}</span>
                                        </div>
                                    ` : ''}
                                    ${beneficios > 0 ? `
                                        <div class="fila-valor">
                                            <span>Beneficios / Bonos:</span>
                                            <span class="monto-valor positivo">+${formatMoneda(beneficios)}</span>
                                        </div>
                                    ` : ''}
                                    ${vacaciones > 0 ? `
                                        <div class="fila-valor">
                                            <span>Vacaciones Pagadas:</span>
                                            <span class="monto-valor positivo">+${formatMoneda(vacaciones)}</span>
                                        </div>
                                    ` : ''}
                                    ${aguinaldo > 0 ? `
                                        <div class="fila-valor">
                                            <span>Aguinaldo Exento:</span>
                                            <span class="monto-valor positivo">+${formatMoneda(aguinaldo)}</span>
                                        </div>
                                    ` : ''}
                                    ${quincenaVeinticinco > 0 ? `
                                        <div class="fila-valor">
                                            <span>Quincena Veinticinco:</span>
                                            <span class="monto-valor positivo">+${formatMoneda(quincenaVeinticinco)}</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="col-pie">
                                    <span>Total Devengado Bruto:</span>
                                    <span>${formatMoneda(totalDevengadoBruto)}</span>
                                </div>
                            </div>

                            <!-- Egresos -->
                            <div class="col-detalle">
                                <div class="col-cabecera">Descuentos y Deducciones</div>
                                <div class="col-cuerpo">
                                    ${descuentoAusencias > 0 ? `
                                        <div class="fila-valor">
                                            <span>Descuento Ausencias:</span>
                                            <span class="monto-valor negativo">-${formatMoneda(descuentoAusencias)}</span>
                                        </div>
                                    ` : ''}
                                    <div class="fila-valor">
                                        <span>Cotización Previsional AFP (7.25%):</span>
                                        <span class="monto-valor negativo">-${formatMoneda(afpEmpleado)}</span>
                                    </div>
                                    <div class="fila-valor">
                                        <span>Seguro Social ISSS (3.00%):</span>
                                        <span class="monto-valor negativo">-${formatMoneda(isssEmpleado)}</span>
                                    </div>
                                    ${rentaEmpleado > 0 ? `
                                        <div class="fila-valor">
                                            <span>Retención de Renta (ISR):</span>
                                            <span class="monto-valor negativo">-${formatMoneda(rentaEmpleado)}</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="col-pie">
                                    <span>Total Retenciones:</span>
                                    <span>${formatMoneda(totalDeducciones)}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Neto Recibir -->
                        <div class="neto-recibir">
                            <div>
                                <span class="neto-titulo">Líquido a Recibir</span>
                                <span class="neto-monto">${formatMoneda(salarioNeto)}</span>
                            </div>
                            <div class="neto-letras">${netoLetras}</div>
                        </div>

                        <!-- Leyenda Explicativa Legal -->
                        ${leyendaExplicativa ? `
                            <div style="background: #fafafa; border: 1px solid #eaeaea; padding: 10px; border-radius: 6px; font-size: 10px; color: #666; font-style: italic; margin-bottom: 16px; line-height: 1.4;">
                                <strong>Nota legal:</strong> ${leyendaExplicativa}
                            </div>
                        ` : ''}

                        <!-- Costeo Patronal -->
                        <div class="costeo-patronal">
                            <div class="costeo-cabecera">Información de Aportes Patronales (Costeo Empresa)</div>
                            <div class="costeo-cuerpo">
                                <div><strong>AFP Patrono (8.75%):</strong> ${formatMoneda(b.afp_patrono)}</div>
                                <div><strong>ISSS Patrono (7.50%):</strong> ${formatMoneda(b.isss_patrono)}</div>
                                <div><strong>INCAF Patrono (1.00%):</strong> ${formatMoneda(b.insaforp_patrono)}</div>
                            </div>
                        </div>

                        <!-- Firmas -->
                        <div class="firmas">
                            <div class="firma-col">
                                <span class="nombre-firma">COMSERTEL, S.A. DE C.V.</span>
                                <span>Firma y Sello del Patrono</span>
                            </div>
                            <div class="firma-col">
                                <span class="nombre-firma">${b.nombres} ${b.apellidos}</span>
                                <span>Firma de Conformidad Empleado</span>
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
                        body { 
                            margin: 0; 
                            padding: 0; 
                            background: white; 
                            font-family: Arial, sans-serif;
                            color: #333;
                        }
                        @media print {
                            body { background: white; }
                            .boleta-page { 
                                page-break-after: always; 
                                padding: 10mm 0;
                            }
                            .boleta-page:last-child { page-break-after: avoid; }
                        }
                        .boleta-page {
                            padding: 20px;
                            box-sizing: border-box;
                        }
                        .boleta-container {
                            border: 2px solid #ddd;
                            padding: 24px;
                            border-radius: 12px;
                            max-width: 800px;
                            margin: 0 auto;
                            box-sizing: border-box;
                        }
                        .membrete {
                            text-align: center;
                            border-bottom: 1px solid #eee;
                            padding-bottom: 12px;
                            margin-bottom: 16px;
                        }
                        .membrete h2 {
                            margin: 0;
                            font-size: 22px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            color: #111;
                        }
                        .membrete .subtitulo {
                            margin: 4px 0 0;
                            font-size: 11px;
                            text-transform: uppercase;
                            color: #666;
                            font-weight: bold;
                            letter-spacing: 0.5px;
                        }
                        .membrete .ubicacion {
                            margin: 2px 0 0;
                            font-size: 10px;
                            color: #888;
                        }
                        .titulo-boleta {
                            text-align: center;
                            margin-bottom: 16px;
                        }
                        .titulo-boleta h3 {
                            margin: 0;
                            font-size: 15px;
                            text-transform: uppercase;
                            color: #333;
                            font-weight: bold;
                        }
                        .titulo-boleta .periodo {
                            margin: 4px 0 0;
                            font-size: 11px;
                            color: #666;
                        }
                        .datos-empleado {
                            display: flex;
                            justify-content: space-between;
                            background: #f9f9f9;
                            padding: 12px 16px;
                            border-radius: 8px;
                            border: 1px solid #eaeaea;
                            margin-bottom: 16px;
                            font-size: 12px;
                            line-height: 1.6;
                        }
                        .datos-empleado .col {
                            width: 48%;
                        }
                        .datos-empleado p {
                            margin: 0 0 6px;
                        }
                        .datos-empleado p:last-child {
                            margin-bottom: 0;
                        }
                        .datos-empleado .label {
                            font-weight: bold;
                            color: #666;
                            text-transform: uppercase;
                            font-size: 9px;
                            letter-spacing: 0.5px;
                            display: block;
                        }
                        .datos-empleado .valor-destacado {
                            font-weight: bold;
                            color: #111;
                        }
                        .detalles-financieros {
                            display: flex;
                            justify-content: space-between;
                            gap: 16px;
                            margin-bottom: 16px;
                            font-size: 12px;
                        }
                        .col-detalle {
                            width: 49%;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            overflow: hidden;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                        }
                        .col-cabecera {
                            background: #f4f4f4;
                            padding: 8px 12px;
                            font-weight: bold;
                            font-size: 10px;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            border-bottom: 1px solid #ddd;
                            color: #444;
                        }
                        .col-cuerpo {
                            padding: 12px;
                            flex-grow: 1;
                        }
                        .fila-valor {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 6px;
                            color: #444;
                        }
                        .fila-valor:last-child {
                            margin-bottom: 0;
                        }
                        .monto-valor {
                            font-weight: 600;
                        }
                        .positivo {
                            color: #2e7d32;
                        }
                        .negativo {
                            color: #c62828;
                        }
                        .col-pie {
                            border-top: 1px solid #eee;
                            background: #fafafa;
                            padding: 10px 12px;
                            display: flex;
                            justify-content: space-between;
                            font-weight: bold;
                            color: #222;
                        }
                        .neto-recibir {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            background: #eef7ff;
                            padding: 16px;
                            border-radius: 8px;
                            border: 1px solid #b3d7ff;
                            margin-bottom: 16px;
                        }
                        .neto-titulo {
                            font-size: 10px;
                            color: #555;
                            text-transform: uppercase;
                            font-weight: bold;
                            display: block;
                            letter-spacing: 0.5px;
                            margin-bottom: 2px;
                        }
                        .neto-monto {
                            font-size: 24px;
                            font-weight: bold;
                            font-family: monospace;
                            color: #004085;
                        }
                        .neto-letras {
                            font-size: 11px;
                            color: #555;
                            font-weight: bold;
                            max-width: 50%;
                            text-align: right;
                            text-transform: uppercase;
                        }
                        .costeo-patronal {
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            overflow: hidden;
                            background: #fdfdfd;
                            font-size: 10px;
                            margin-bottom: 16px;
                        }
                        .costeo-cabecera {
                            background: #f4f4f4;
                            padding: 6px 12px;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            color: #666;
                            border-bottom: 1px solid #ddd;
                        }
                        .costeo-cuerpo {
                            padding: 10px 12px;
                            display: flex;
                            justify-content: space-between;
                        }
                        .firmas {
                            display: flex;
                            justify-content: space-between;
                            margin-top: 40px;
                            text-align: center;
                            font-size: 10px;
                            gap: 40px;
                        }
                        .firma-col {
                            flex: 1;
                            border-top: 1px solid #888;
                            padding-top: 6px;
                            color: #666;
                        }
                        .nombre-firma {
                            font-size: 11px;
                            font-weight: bold;
                            color: #222;
                            display: block;
                            margin-bottom: 2px;
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

            const salarioBaseNumerico = Number(b.salario_base) || 0;
            const salarioProporcional = planilla.tipo_periodo === 'QUINCENAL'
                ? salarioBaseNumerico / 2.0
                : salarioBaseNumerico;



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
        const csvString = "\uFEFF" + headers.join(",") + "\n" + rows.map(rowArray => rowArray.join(",")).join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Planilla_${planilla.id}_Periodo_${planilla.fecha_inicio}_al_${planilla.fecha_fin}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);

        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${esBorrador ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
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

            {/* Consolidado General y Resumen Unificado de la Planilla */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-6 space-y-6 shadow-sm text-left">
                {/* Cabecera: Resumen de Planilla */}
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Resumen de Planilla #{planilla.id}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-500 dark:text-slate-400 pt-3 items-start">
                        <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-slate-700 dark:text-white">Rango de fechas general:</span>
                            <span>{formatFechaLocal(planilla.fecha_inicio)} al {formatFechaLocal(planilla.fecha_fin)}</span>
                            {resumen.total_quincena_veinticinco > 0 && (
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold italic mt-1 block leading-normal">
                                    <i className="bi bi-info-circle-fill mr-1"></i>
                                    Aplicado para Quincena Veinticinco: Pago al 25/01/{parseFechaLocal(planilla.fecha_inicio) ? parseFechaLocal(planilla.fecha_inicio).getFullYear() : new Date().getFullYear()} según pacto colectivo.
                                </span>
                            )}
                            {resumen.total_aguinaldo > 0 && (
                                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold italic mt-1 block leading-normal">
                                    <i className="bi bi-info-circle-fill mr-1"></i>
                                    Aplicado para Aguinaldo de Ley: Fecha de goce programada individual del 20 de Octubre al 20 de Diciembre (Art. 200 C.T.)
                                </span>
                            )}
                        </div>
                        <p><span className="font-semibold text-slate-700 dark:text-white">Tipo de planilla:</span> {planilla.tipo_periodo}</p>
                        <p><span className="font-semibold text-slate-700 dark:text-white">Fecha Generación:</span> {new Date(planilla.creado_en).toLocaleString()}</p>
                    </div>
                </div>

                {/* Contenido: Consolidado de Costos y Prestaciones */}
                <div>
                    <h3 className="font-bold text-md text-slate-800 dark:text-white pb-3 uppercase text-xs tracking-wider">
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
                </div>
            </div>

            {/* Filtros de Busqueda en Pantalla */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center print:hidden mt-6 mb-6">
                <div className="relative flex-1 w-full">
                    <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Buscar empleado o cargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent text-slate-850 dark:text-white"
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={areaFilter}
                        onChange={(e) => setAreaFilter(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent text-slate-850 dark:text-white"
                    >
                        <option value="">Todas las Areas</option>
                        {uniqueAreas.map((area, idx) => (
                            <option key={idx} value={area}>{area}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Listado de Boletas Individuales - Matriz Planilla Consolidada */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center print:hidden">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-md uppercase tracking-wider m-0">Detalle de Empleados en Planilla</h3>
                        <p className="text-slate-400 text-xs mt-1">Matriz Planilla - {planilla.tipo_periodo}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 rounded-lg">
                        Registros: {filteredBoletas.length} de {processedBoletas.length}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-left border-collapse print-table">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider text-slate-950 dark:text-white">
                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-850/50 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">N°</th>
                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-850/50 sticky left-8 bg-slate-50 dark:bg-slate-900 z-10">Colaborador</th>
                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-850/50 font-bold">Area</th>
                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-850/50 font-bold">Puesto</th>
                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-850/50">Ingreso</th>
                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-850/50">Corte Planilla</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">Sueldo-Salario</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">Viaticos</th>
                                <th className="py-3 px-4 border-r border-slate-100 dark:border-slate-850/50 text-center">Mes Ingreso</th>
                                <th className="py-3 px-4 text-center border-r border-slate-100 dark:border-slate-850/50">Tiempo (años)</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">Horas Ext D.</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">Horas Ext N.</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">Monto Vac.</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">Boni Vac.</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">Aguinaldo</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">Quincena 25</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50 font-bold">Monto Cotizable</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">ISSS Patr.</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">AFP Patr.</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">ISSS Emp.</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">AFP Emp.</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50">ISR (Renta)</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50 font-bold">Neto a Depositar</th>
                                <th className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-850/50 font-bold">Planilla Unica</th>
                                <th className="py-3 px-4 text-center font-bold">Boleta</th>
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
                                    <td className="py-3 px-4 text-right border-r border-slate-100 dark:border-slate-800/50 font-mono font-bold">{formatMoneda(b.montoPlanillaUnica)}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => {
                                                const originalBoleta = boletas.find(bo => bo.id === b.id);
                                                setSelectedBoleta(originalBoleta);
                                            }}
                                            className="border border-blue-600 hover:bg-blue-50 text-blue-600 dark:border-white dark:text-white dark:hover:bg-white/10 px-2 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                        >
                                            Ver Boleta
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* Fila de Totales Generales (TOTAL PLANILLA) */}
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

    // BYPASS TEMPORAL DE MESES PARA PRUEBAS (TAREA 19 - SPRINT 5)
    const opcionesMesesBypass = nombresMeses.map((nombre, index) => ({
        valor: `${anioActual}-${String(index + 1).padStart(2, '0')}`,
        label: `${nombre} ${anioActual}`
    }));

    const [mesSeleccionado, setMesSeleccionado] = useState(opcionMesActual.valor);
    const [quincenaSeleccionada, setQuincenaSeleccionada] = useState('1'); // '1' o '2', solo se usa si tipoPeriodo === 'QUINCENAL'
    const [esVoluntarioAceptado, setEsVoluntarioAceptado] = useState(true);
    const [fechaPagoQ25, setFechaPagoQ25] = useState('');

    useEffect(() => {
        if (mesSeleccionado === '2026-01') {
            setFechaPagoQ25('2026-01-25');
        } else {
            setFechaPagoQ25('');
        }
    }, [mesSeleccionado]);

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
                        initNov[e.id] = {
                            beneficios: '',
                            vacaciones: '',
                            viaticos: '',
                            horas_extras_diurnas_qty: '',
                            horas_extras_nocturnas_qty: ''
                        };
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

    useEffect(() => {
        if (empleados.length === 0 || !fechaInicio || !fechaFin) return;

        let mesInt = 0;
        if (fechaInicio) {
            const partes = fechaInicio.split('-');
            if (partes.length === 3) {
                mesInt = parseInt(partes[1], 10);
            }
        }

        const fetchNovedadesRango = async () => {
            try {
                const response = await getNovedadesPorRango(fechaInicio, fechaFin);
                const novBaseDatos = {};
                if (response.status === 'success' && Array.isArray(response.data)) {
                    response.data.forEach(item => {
                        novBaseDatos[item.id_empleado] = {
                            beneficios: item.beneficios > 0 ? String(item.beneficios) : '',
                            viaticos: item.viaticos > 0 ? String(item.viaticos) : '',
                            horas_extras_diurnas_qty: item.horas_extras_diurnas > 0 ? String(item.horas_extras_diurnas) : '',
                            horas_extras_nocturnas_qty: item.horas_extras_nocturnas > 0 ? String(item.horas_extras_nocturnas) : ''
                        };
                    });
                }

                setNovedades(prev => {
                    const updated = { ...prev };
                    empleados.forEach(emp => {
                        const cumpleMes = emp.mes_vacaciones !== null && emp.mes_vacaciones === mesInt;
                        const autoVal = cumpleMes
                            ? Math.round(((parseFloat(emp.salario_base) / 2.0) * 1.30) * 100) / 100
                            : 0.00;

                        const dbData = novBaseDatos[emp.id] || {
                            beneficios: '',
                            viaticos: '',
                            horas_extras_diurnas_qty: '',
                            horas_extras_nocturnas_qty: ''
                        };

                        updated[emp.id] = {
                            ...dbData,
                            vacaciones: autoVal > 0 ? autoVal : ''
                        };
                    });
                    return updated;
                });
            } catch (err) {
                console.error('Error al cargar las novedades del periodo:', err);
            }
        };

        fetchNovedadesRango();
    }, [fechaInicio, fechaFin, empleados]);

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
                const emp = empleados.find(e => e.id === Number(empId));
                const salarioBase = emp ? parseFloat(emp.salario_base) : 0.0;

                const ben = parseFloat(novedades[empId].beneficios) || 0.0;
                const vac = parseFloat(novedades[empId].vacaciones) || 0.0;
                const via = parseFloat(novedades[empId].viaticos) || 0.0;

                // Calculo automatico de horas extras en dolares
                const hedQty = parseFloat(novedades[empId].horas_extras_diurnas_qty) || 0.0;
                const hedMonto = Math.round((hedQty * (salarioBase / 120.0)) * 100) / 100;

                const henQty = parseFloat(novedades[empId].horas_extras_nocturnas_qty) || 0.0;
                const henMonto = Math.round((henQty * (salarioBase / 96.0)) * 100) / 100;

                if (ben > 0 || vac > 0 || via > 0 || hedMonto > 0 || henMonto > 0) {
                    return {
                        id_empleado: Number(empId),
                        beneficios: ben,
                        vacaciones: vac,
                        viaticos: via,
                        horas_extras_diurnas: hedMonto,
                        horas_extras_nocturnas: henMonto
                    };
                }
                return null;
            })
            .filter(n => n !== null);

        if (mesSeleccionado === '2026-01' && esVoluntarioAceptado) {
            if (!fechaPagoQ25) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fecha requerida',
                    text: 'Debe ingresar la fecha de pago efectiva para la Quincena Veinticinco.'
                });
                return;
            }
            const fechaPago = new Date(fechaPagoQ25 + 'T00:00:00');
            const minDate = new Date('2026-01-15T00:00:00');
            const maxDate = new Date('2026-01-25T00:00:00');
            if (fechaPago < minDate || fechaPago > maxDate) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fecha inválida',
                    text: 'La fecha de pago efectiva de la Quincena Veinticinco debe estar entre el 15 y el 25 de enero.'
                });
                return;
            }
        }

        setLoading(true);
        try {
            const response = await generarPlanilla({
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
                tipo_periodo: tipoPeriodo,
                novedades: novedadesEnviar,
                esVoluntarioAceptado: esVoluntarioAceptado,
                fechaPagoQ25: fechaPagoQ25 || null
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
                            {opcionesMesesBypass.map(opcion => (
                                <option key={opcion.valor} value={opcion.valor}>{opcion.label}</option>
                            ))}
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

                {mesSeleccionado === '2026-01' && (
                    <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="text-left">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Aplicar Quincena Veinticinco (Voluntario 2026)</h4>
                                <p className="text-xs text-slate-400">Marque esta opción si la empresa aplicará de forma voluntaria el beneficio de la Quincena 25 en este período.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={esVoluntarioAceptado}
                                onChange={(e) => setEsVoluntarioAceptado(e.target.checked)}
                                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                            />
                        </div>

                        {esVoluntarioAceptado && (
                            <div className="flex flex-col gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-left">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Fecha de Pago Efectiva (Obligatorio 15 - 25 de Enero):
                                    </label>
                                    <input
                                        type="date"
                                        min="2026-01-15"
                                        max="2026-01-25"
                                        value={fechaPagoQ25}
                                        onChange={(e) => setFechaPagoQ25(e.target.value)}
                                        className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 w-full sm:w-48 text-slate-800 dark:text-slate-100"
                                    />
                                </div>
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg flex items-start gap-2">
                                    <i className="bi bi-info-circle text-blue-600 dark:text-blue-400 mt-0.5 text-sm"></i>
                                    <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-normal">
                                        El Decreto No. 499 establece que la Quincena Veinticinco debe pagarse estrictamente entre el 15 y el 25 de enero. Ingrese la fecha efectiva de pago; el sistema calculará la antigüedad y el salario base de los colaboradores vigentes a ese día.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Listado de Novedades por Empleado */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-left space-y-3">
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-md uppercase text-xs tracking-wider m-0">Registrar Novedades y Prestaciones Adicionales</h3>
                        <p className="text-slate-400 text-xs mt-1">Ingresa bonificaciones o pagos de vacaciones que deban liquidarse en esta planilla (opcional).</p>
                    </div>
                    {(() => {
                        const empleadosConAguinaldo = empleados.filter(emp => {
                            if (!emp.fecha_aguinaldo) return false;
                            const fAguinaldo = parseFechaLocal(emp.fecha_aguinaldo);
                            const fInicio = parseFechaLocal(fechaInicio);
                            const fFin = parseFechaLocal(fechaFin);
                            return fAguinaldo && fInicio && fFin && fAguinaldo >= fInicio && fAguinaldo <= fFin;
                        });
                        if (empleadosConAguinaldo.length > 0) {
                            return (
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex items-start gap-2 text-left">
                                    <i className="bi bi-info-circle text-emerald-600 dark:text-emerald-400 mt-0.5 text-sm"></i>
                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-normal font-medium">
                                        Se han detectado {empleadosConAguinaldo.length} colaboradores con pago de aguinaldo programado para este período. El sistema procesará sus aguinaldos de forma automática.
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })()}
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
                                    <th className="py-4 px-6">Aguinaldo Programado ($)</th>
                                    <th className="py-4 px-6">Viáticos ($)</th>
                                    <th className="py-4 px-6">Horas Extras Diurnas (Hrs)</th>
                                    <th className="py-4 px-6">Horas Extras Nocturnas (Hrs)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {empleados.map((emp) => {
                                    // Evaluar si tiene aguinaldo en este periodo
                                    let aguinaldoTexto = 'No programado';
                                    let aguinaldoValor = 0.00;
                                    let esAguinaldoEnPeriodo = false;

                                    if (emp.fecha_aguinaldo) {
                                        const fAguinaldo = parseFechaLocal(emp.fecha_aguinaldo);
                                        const fInicio = parseFechaLocal(fechaInicio);
                                        const fFin = parseFechaLocal(fechaFin);

                                        if (fAguinaldo && fInicio && fFin) {
                                            if (fAguinaldo >= fInicio && fAguinaldo <= fFin) {
                                                esAguinaldoEnPeriodo = true;
                                                aguinaldoValor = calcularAguinaldoFrontend(emp.salario_base, emp.fecha_ingreso, fechaFin);
                                                aguinaldoTexto = `${formatFechaLocal(emp.fecha_aguinaldo)} (${formatMoneda(aguinaldoValor)})`;
                                            } else {
                                                aguinaldoTexto = `Fuera de período (${formatFechaLocal(emp.fecha_aguinaldo)})`;
                                            }
                                        }
                                    }

                                    return (
                                        <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-slate-800 dark:text-white">
                                                {emp.nombres} {emp.apellidos}
                                            </td>
                                            <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{emp.cargo}</td>
                                            <td className="py-4 px-6 font-mono font-medium">{formatMoneda(emp.salario_base)}</td>
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-sm font-semibold">
                                                    {novedades[emp.id]?.beneficios && parseFloat(novedades[emp.id].beneficios) > 0
                                                        ? formatMoneda(novedades[emp.id].beneficios)
                                                        : '$0.00'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-semibold ${novedades[emp.id]?.vacaciones && parseFloat(novedades[emp.id].vacaciones) > 0
                                                        ? 'text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md'
                                                        : 'text-slate-400 dark:text-slate-500 font-medium'
                                                        }`}>
                                                        {novedades[emp.id]?.vacaciones && parseFloat(novedades[emp.id].vacaciones) > 0
                                                            ? formatMoneda(novedades[emp.id].vacaciones)
                                                            : 'No programadas'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-semibold ${esAguinaldoEnPeriodo
                                                        ? 'text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md'
                                                        : 'text-slate-400 dark:text-slate-500 font-medium'
                                                        }`}>
                                                        {aguinaldoTexto}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-mono text-sm font-semibold">
                                                    {novedades[emp.id]?.viaticos && parseFloat(novedades[emp.id].viaticos) > 0
                                                        ? formatMoneda(novedades[emp.id].viaticos)
                                                        : '$0.00'}
                                                </span>
                                            </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-white">
                                                    {novedades[emp.id]?.horas_extras_diurnas_qty && parseFloat(novedades[emp.id].horas_extras_diurnas_qty) > 0
                                                        ? `${novedades[emp.id].horas_extras_diurnas_qty} hrs`
                                                        : '0 hrs'}
                                                </span>
                                                {novedades[emp.id]?.horas_extras_diurnas_qty && parseFloat(novedades[emp.id].horas_extras_diurnas_qty) > 0 && (
                                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                                                        + {formatMoneda(Math.round((parseFloat(novedades[emp.id].horas_extras_diurnas_qty) * (parseFloat(emp.salario_base) / 120.0)) * 100) / 100)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-semibold text-slate-800 dark:text-white">
                                                    {novedades[emp.id]?.horas_extras_nocturnas_qty && parseFloat(novedades[emp.id].horas_extras_nocturnas_qty) > 0
                                                        ? `${novedades[emp.id].horas_extras_nocturnas_qty} hrs`
                                                        : '0 hrs'}
                                                </span>
                                                {novedades[emp.id]?.horas_extras_nocturnas_qty && parseFloat(novedades[emp.id].horas_extras_nocturnas_qty) > 0 && (
                                                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold">
                                                        + {formatMoneda(Math.round((parseFloat(novedades[emp.id].horas_extras_nocturnas_qty) * (parseFloat(emp.salario_base) / 96.0)) * 100) / 100)}
                                                    </span>
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
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${esBorrador ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' : 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'
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
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="border border-red-600 hover:bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
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
                            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 cursor-pointer flex items-center ${viewMode === 'list'
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
                            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 cursor-pointer flex items-center ${viewMode === 'generar'
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
