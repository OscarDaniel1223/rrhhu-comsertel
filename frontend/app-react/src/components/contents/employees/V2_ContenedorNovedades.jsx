import React, { useState, useEffect } from 'react';
import { getEmpleados } from '../../../services/employees/v2_empleadoService';
import { getNovedadesPorFecha, getNovedadesPorRango, saveNovedadesPorFecha } from '../../../services/employees/v2_novedadesService';
import Swal from 'sweetalert2';

const V2_ContenedorNovedades = () => {
    // Estado de pestañas: 'registro' (Diario) o 'historial' (Acumulado Mensual)
    const [activeTab, setActiveTab] = useState('registro');
    
    // Estados comunes
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- ESTADOS PESTAÑA REGISTRO DIARIO ---
    const [novedadesDiarias, setNovedadesDiarias] = useState({}); // { [empId]: { horas_extras_diurnas, ... } }
    const [savingDiario, setSavingDiario] = useState(false);
    
    const getFechaHoy = () => {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${anio}-${mes}-${dia}`;
    };
    const [fechaSeleccionada, setFechaSeleccionada] = useState(getFechaHoy());

    // --- ESTADOS PESTAÑA HISTORIAL MENSUAL ---
    const [novedadesMensuales, setNovedadesMensuales] = useState([]); // Array de novedades consolidadas
    const [mesFiltroInt, setMesFiltroInt] = useState(new Date().getMonth() + 1);
    const [anioFiltroInt, setAnioFiltroInt] = useState(new Date().getFullYear());
    const mesFiltro = `${anioFiltroInt}-${String(mesFiltroInt).padStart(2, '0')}`;


    // --- CARGA DE DATOS REGISTRO DIARIO ---
    const loadDatosDiarios = async () => {
        if (!fechaSeleccionada) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // 1. Obtener empleados activos
            const empResponse = await getEmpleados();
            let activos = [];
            if (empResponse.status === 'success') {
                activos = empResponse.data.filter(e => e.estado === 'ACTIVO');
                setEmpleados(activos);
            }

            // 2. Obtener novedades de la fecha seleccionada
            const novResponse = await getNovedadesPorFecha(fechaSeleccionada);
            const novMap = {};

            // Inicializar todos los empleados activos con campos vacios
            activos.forEach(e => {
                novMap[e.id] = {
                    horas_extras_diurnas: '',
                    horas_extras_nocturnas: '',
                    viaticos: '',
                    beneficios: ''
                };
            });

            // Llenar con datos existentes para ese dia
            if (novResponse.status === 'success' && Array.isArray(novResponse.data)) {
                novResponse.data.forEach(item => {
                    if (novMap[item.id_empleado]) {
                        novMap[item.id_empleado] = {
                            horas_extras_diurnas: item.horas_extras_diurnas > 0 ? String(item.horas_extras_diurnas) : '',
                            horas_extras_nocturnas: item.horas_extras_nocturnas > 0 ? String(item.horas_extras_nocturnas) : '',
                            viaticos: item.viaticos > 0 ? String(item.viaticos) : '',
                            beneficios: item.beneficios > 0 ? String(item.beneficios) : ''
                        };
                    }
                });
            }

            setNovedadesDiarias(novMap);
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Red',
                text: 'No se pudieron cargar las novedades del dia.'
            });
        } finally {
            setLoading(false);
        }
    };

    // --- CARGA DE DATOS HISTORIAL MENSUAL ---
    const loadDatosMensuales = async () => {
        if (!mesFiltro) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // 1. Obtener empleados activos
            const empResponse = await getEmpleados();
            let activos = [];
            if (empResponse.status === 'success') {
                activos = empResponse.data.filter(e => e.estado === 'ACTIVO');
                setEmpleados(activos);
            }

            // 2. Calcular fecha de inicio y fin del mes
            const [anioStr, mesStr] = mesFiltro.split('-');
            const anio = parseInt(anioStr, 10);
            const mes = parseInt(mesStr, 10);
            const ultimoDia = new Date(anio, mes, 0).getDate();
            const fechaInicio = `${anioStr}-${mesStr}-01`;
            const fechaFin = `${anioStr}-${mesStr}-${String(ultimoDia).padStart(2, '0')}`;

            // 3. Obtener novedades en el rango de fechas del mes completo
            const novResponse = await getNovedadesPorRango(fechaInicio, fechaFin);
            
            if (novResponse.status === 'success' && Array.isArray(novResponse.data)) {
                setNovedadesMensuales(novResponse.data);
            } else {
                setNovedadesMensuales([]);
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Red',
                text: 'No se pudo obtener el historial de novedades.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Control de carga reactivo según pestaña seleccionada
    useEffect(() => {
        if (activeTab === 'registro') {
            loadDatosDiarios();
        } else {
            loadDatosMensuales();
        }
    }, [activeTab, fechaSeleccionada, mesFiltro]);

    // Manejar cambios en los inputs del registro diario
    const handleInputChange = (empleadoId, campo, valor) => {
        if (valor !== '' && isNaN(Number(valor))) return;
        setNovedadesDiarias(prev => ({
            ...prev,
            [empleadoId]: {
                ...prev[empleadoId],
                [campo]: valor
            }
        }));
    };

    // Fórmulas de ley
    const calcularMontoExtraDiurna = (salarioBase, qtyStr) => {
        const qty = parseFloat(qtyStr) || 0;
        if (qty <= 0) return 0;
        return Math.round((qty * (parseFloat(salarioBase) / 120.0)) * 100) / 100;
    };

    const calcularMontoExtraNocturna = (salarioBase, qtyStr) => {
        const qty = parseFloat(qtyStr) || 0;
        if (qty <= 0) return 0;
        return Math.round((qty * (parseFloat(salarioBase) / 96.0)) * 100) / 100;
    };

    const calcularSubtotal = (empId, salarioBase) => {
        const record = novedadesDiarias[empId] || {};
        const hed = calcularMontoExtraDiurna(salarioBase, record.horas_extras_diurnas);
        const hen = calcularMontoExtraNocturna(salarioBase, record.horas_extras_nocturnas);
        const via = parseFloat(record.viaticos) || 0;
        const ben = parseFloat(record.beneficios) || 0;
        return hed + hen + via + ben;
    };

    // Guardar las novedades de la fecha seleccionada
    const handleSaveDiario = async () => {
        if (!fechaSeleccionada) {
            Swal.fire({
                icon: 'warning',
                title: 'Fecha Requerida',
                text: 'Debe seleccionar una fecha valida para poder guardar.'
            });
            return;
        }

        setSavingDiario(true);
        try {
            const novedadesList = Object.keys(novedadesDiarias).map(empId => {
                const item = novedadesDiarias[empId];
                return {
                    id_empleado: parseInt(empId, 10),
                    horas_extras_diurnas: parseFloat(item.horas_extras_diurnas) || 0.00,
                    horas_extras_nocturnas: parseFloat(item.horas_extras_nocturnas) || 0.00,
                    viaticos: parseFloat(item.viaticos) || 0.00,
                    beneficios: parseFloat(item.beneficios) || 0.00
                };
            });

            const response = await saveNovedadesPorFecha(fechaSeleccionada, novedadesList);
            if (response.status === 'success') {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                });
                Toast.fire({
                    icon: 'success',
                    title: 'Novedades diarias guardadas con exito'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error al Guardar',
                text: 'No se pudieron guardar las novedades de este dia.'
            });
        } finally {
            setSavingDiario(false);
        }
    };

    // Filtrar la lista de empleados (Buscador)
    const filterEmpleadosRegistro = () => {
        return empleados.filter(emp => {
            const nombreCompleto = `${emp.nombres} ${emp.apellidos}`.toLowerCase();
            return nombreCompleto.includes(searchTerm.toLowerCase()) ||
                emp.cargo?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    };

    const filterEmpleadosHistorial = () => {
        return novedadesMensuales.filter(item => {
            const nombreCompleto = `${item.nombres} ${item.apellidos}`.toLowerCase();
            return nombreCompleto.includes(searchTerm.toLowerCase()) ||
                item.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.departamento && item.departamento.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    };

    const formatMoneda = (val) => {
        return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(val);
    };

    const parseFechaFormateada = (fechaStr) => {
        if (!fechaStr) return '';
        const partes = fechaStr.split('-');
        if (partes.length !== 3) return fechaStr;
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    };

    // Formatear mes de filtrado a cadena amigable
    const formatMesAmigable = (mesStr) => {
        if (!mesStr) return '';
        const [anio, mes] = mesStr.split('-');
        const nombresMeses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const mesInt = parseInt(mes, 10);
        return `${nombresMeses[mesInt - 1]} ${anio}`;
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
            {/* Cabecera */}
            <div className="flex flex-col items-center justify-center text-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestion de Horas Extras, Viaticos y Beneficios</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Controla el seguimiento diario de horas extras y viáticos del personal, o visualiza los consolidados históricos mensuales acumulados.
                    </p>
                </div>
            </div>

            {/* Pestañas de Alternancia (Tabs) */}
            <div className="mb-8 flex justify-center">
                <nav className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[15px]" aria-label="Tabs">
                    <button
                        onClick={() => { setActiveTab('registro'); setSearchTerm(''); }}
                        className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 cursor-pointer flex items-center ${
                            activeTab === 'registro'
                                ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        <i className="bi bi-calendar-event me-2"></i>
                        Registrar Novedades Diarias
                    </button>

                    <button
                        onClick={() => { setActiveTab('historial'); setSearchTerm(''); }}
                        className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 cursor-pointer flex items-center ${
                            activeTab === 'historial'
                                ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        <i className="bi bi-clock-history me-2"></i>
                        Historial Acumulado Mensual
                    </button>
                </nav>
            </div>

            {/* Tarjeta Informativa de Ley */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-5 rounded-2xl shadow-sm mb-6 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i className="bi bi-info-circle text-blue-600"></i>
                        Reglas de Calculo Aplicadas (Codigo de Trabajo de El Salvador)
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-4xl">
                        Las horas extras diurnas se pagan al doble (100% de recargo). Las nocturnas ordinarias tienen un 25% de recargo base, y las extras nocturnas se pagan con 100% de recargo sobre el valor de la hora nocturna (factor de escala `Salario/96`). Los viaticos estan exentos de ISSS, AFP e ISR.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 font-mono text-xs rounded-xl p-3 border border-blue-100 dark:border-blue-900/30 whitespace-nowrap">
                        <span className="font-bold block text-slate-700 dark:text-slate-300">Hora Extra Diurna:</span>
                        Valor = (Salario Base / 120) * Horas
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 font-mono text-xs rounded-xl p-3 border border-purple-100 dark:border-purple-900/30 whitespace-nowrap">
                        <span className="font-bold block text-slate-700 dark:text-slate-300">Hora Extra Nocturna:</span>
                        Valor = (Salario Base / 96) * Horas
                    </div>
                </div>
            </div>

            {/* SECCIÓN PESTAÑA A: REGISTRO DIARIO */}
            {activeTab === 'registro' && (
                <>
                    {/* Controles */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                            <div className="flex flex-col gap-1 w-full sm:w-auto">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Seleccionar Dia de Gestion:</label>
                                <input
                                    type="date"
                                    value={fechaSeleccionada}
                                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                />
                            </div>
                            <div className="relative w-full sm:w-72 mt-5 sm:mt-0 flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Buscar Colaborador:</label>
                                <div className="relative">
                                    <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-sm"></i>
                                    <input
                                        type="text"
                                        placeholder="Buscar por colaborador o cargo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex justify-end">
                            <button
                                onClick={handleSaveDiario}
                                disabled={savingDiario || loading || !fechaSeleccionada}
                                className={`w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer ${
                                    (savingDiario || loading || !fechaSeleccionada) ? 'opacity-60 cursor-not-allowed' : ''
                                }`}
                            >
                                {savingDiario ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-save"></i>
                                        Guardar Novedades del Dia
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Tabla de Registro */}
                    {!fechaSeleccionada ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
                            <i className="bi bi-calendar-event text-4xl text-slate-300 dark:text-slate-600 block mb-3"></i>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold">Seleccione una fecha valida</p>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
                            <span className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></span>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando novedades del dia {parseFechaFormateada(fechaSeleccionada)}...</p>
                        </div>
                    ) : filterEmpleadosRegistro().length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
                            <i className="bi bi-people text-4xl text-slate-300 dark:text-slate-600 block mb-3"></i>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold">No se encontraron empleados activos</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700/30 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Modo Registro: {parseFechaFormateada(fechaSeleccionada)}
                                </span>
                                <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-semibold">
                                    {filterEmpleadosRegistro().length} Colaboradores Activos
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/20 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-700/50">
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Colaborador</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Salario Base</th>
                                            <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-44">Horas Extras Diurnas</th>
                                            <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-44">Horas Extras Nocturnas</th>
                                            <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-36">Viaticos ($)</th>
                                            <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-36">Beneficios ($)</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Subtotal Extra</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {filterEmpleadosRegistro().map(emp => {
                                            const record = novedadesDiarias[emp.id] || {
                                                horas_extras_diurnas: '',
                                                horas_extras_nocturnas: '',
                                                viaticos: '',
                                                beneficios: ''
                                            };
                                            const hedMonto = calcularMontoExtraDiurna(emp.salario_base, record.horas_extras_diurnas);
                                            const henMonto = calcularMontoExtraNocturna(emp.salario_base, record.horas_extras_nocturnas);
                                            const subtotal = calcularSubtotal(emp.id, emp.salario_base);

                                            return (
                                                <tr key={emp.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-900 dark:text-white">{emp.nombres} {emp.apellidos}</div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{emp.cargo}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-sm font-semibold">{formatMoneda(emp.salario_base)}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Horas"
                                                                value={record.horas_extras_diurnas}
                                                                onChange={(e) => handleInputChange(emp.id, 'horas_extras_diurnas', e.target.value)}
                                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                                            />
                                                            {hedMonto > 0 && <span className="text-[10px] text-green-600 dark:text-green-400 font-bold font-mono">+ {formatMoneda(hedMonto)}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <input
                                                                type="text"
                                                                placeholder="Horas"
                                                                value={record.horas_extras_nocturnas}
                                                                onChange={(e) => handleInputChange(emp.id, 'horas_extras_nocturnas', e.target.value)}
                                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                                            />
                                                            {henMonto > 0 && <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold font-mono">+ {formatMoneda(henMonto)}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="text"
                                                            placeholder="0.00"
                                                            value={record.viaticos}
                                                            onChange={(e) => handleInputChange(emp.id, 'viaticos', e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="text"
                                                            placeholder="0.00"
                                                            value={record.beneficios}
                                                            onChange={(e) => handleInputChange(emp.id, 'beneficios', e.target.value)}
                                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        {subtotal > 0 ? formatMoneda(subtotal) : '$0.00'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* SECCIÓN PESTAÑA B: HISTORIAL MENSUAL */}
            {activeTab === 'historial' && (
                <>
                    {/* Controles */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <div className="flex flex-col gap-1 w-full sm:w-auto">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Seleccionar Mes:</label>
                                    <select
                                        value={mesFiltroInt}
                                        onChange={(e) => setMesFiltroInt(parseInt(e.target.value, 10))}
                                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
                                    >
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
                                <div className="flex flex-col gap-1 w-full sm:w-auto">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Seleccionar Año:</label>
                                    <select
                                        value={anioFiltroInt}
                                        onChange={(e) => setAnioFiltroInt(parseInt(e.target.value, 10))}
                                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
                                    >
                                        {(() => {
                                            const anioActual = new Date().getFullYear();
                                            const anios = [anioActual - 1, anioActual, anioActual + 1];
                                            return anios.map(a => (
                                                <option key={a} value={a}>{a}</option>
                                            ));
                                        })()}
                                    </select>
                                </div>
                            </div>
                            <div className="relative w-full sm:w-72 mt-5 sm:mt-0 flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Buscar Colaborador:</label>
                                <div className="relative">
                                    <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-sm"></i>
                                    <input
                                        type="text"
                                        placeholder="Buscar por colaborador o cargo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="text-xs bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-300 font-semibold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50">
                            Periodo: <span className="font-bold text-blue-600 dark:text-blue-400">{formatMesAmigable(mesFiltro)}</span>
                        </div>
                    </div>

                    {/* Tabla de Historial Acumulado */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
                            <span className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></span>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Consolidando acumulados del mes...</p>
                        </div>
                    ) : filterEmpleadosHistorial().length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
                            <i className="bi bi-file-earmark-bar-graph text-4xl text-slate-300 dark:text-slate-600 block mb-3"></i>
                            <p className="text-slate-500 dark:text-slate-400 font-semibold">No se registran novedades acumuladas para este mes</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700/30 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Resumen Acumulado del Mes
                                </span>
                                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-semibold">
                                    {filterEmpleadosHistorial().length} Colaboradores Registrados
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/20 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-700/50">
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Colaborador</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Salario Base</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Horas Extras Diurnas</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Horas Extras Nocturnas</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Viaticos ($)</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Beneficios ($)</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Monto Acumulado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                        {filterEmpleadosHistorial().map(item => {
                                            const salBase = parseFloat(item.salario_base) || 0;
                                            const qtyHed = parseFloat(item.horas_extras_diurnas) || 0;
                                            const qtyHen = parseFloat(item.horas_extras_nocturnas) || 0;
                                            const via = parseFloat(item.viaticos) || 0;
                                            const ben = parseFloat(item.beneficios) || 0;

                                            const hedMonto = Math.round((qtyHed * (salBase / 120.0)) * 100) / 100;
                                            const henMonto = Math.round((qtyHen * (salBase / 96.0)) * 100) / 100;
                                            const totalAcumulado = hedMonto + henMonto + via + ben;

                                            return (
                                                <tr key={item.id_empleado} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-900 dark:text-white">
                                                            {item.nombres} {item.apellidos}
                                                        </div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                                            Cargo: Colaborador Activo
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-sm font-semibold">
                                                        {formatMoneda(salBase)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">{qtyHed} hrs</span>
                                                            {hedMonto > 0 && (
                                                                <span className="text-[10px] text-green-600 dark:text-green-400 font-bold font-mono">
                                                                    {formatMoneda(hedMonto)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">{qtyHen} hrs</span>
                                                            {henMonto > 0 && (
                                                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold font-mono">
                                                                    {formatMoneda(henMonto)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-sm font-semibold">
                                                        {via > 0 ? formatMoneda(via) : '$0.00'}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-sm font-semibold">
                                                        {ben > 0 ? formatMoneda(ben) : '$0.00'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                                                        {totalAcumulado > 0 ? formatMoneda(totalAcumulado) : '$0.00'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default V2_ContenedorNovedades;
