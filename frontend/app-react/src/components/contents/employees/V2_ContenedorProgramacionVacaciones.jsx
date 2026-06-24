import React, { useState, useEffect } from 'react';
import { getEmpleados, programarVacacion } from '../../../services/employees/v2_empleadoService';
import Swal from 'sweetalert2';

const parseFechaLocal = (f) => {
    if (!f) return null;
    const d = new Date(f);
    // Retornamos una nueva fecha solo con año, mes y día local
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const formatFechaLocal = (f) => {
    if (!f) return '';
    const date = new Date(f);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
};

const MESES = [
    { valor: 1, label: 'Enero' },
    { valor: 2, label: 'Febrero' },
    { valor: 3, label: 'Marzo' },
    { valor: 4, label: 'Abril' },
    { valor: 5, label: 'Mayo' },
    { valor: 6, label: 'Junio' },
    { valor: 7, label: 'Julio' },
    { valor: 8, label: 'Agosto' },
    { valor: 9, label: 'Septiembre' },
    { valor: 10, label: 'Octubre' },
    { valor: 11, label: 'Noviembre' },
    { valor: 12, label: 'Diciembre' }
];

const V2_ContenedorProgramacionVacaciones = () => {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('aptos'); // 'aptos' o 'no_elegibles'
    const [filtroMes, setFiltroMes] = useState('todos');

    const fetchEmpleados = async () => {
        setLoading(true);
        try {
            const response = await getEmpleados();
            if (response.status === 'success') {
                setEmpleados(response.data);
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Red',
                text: 'No se pudieron obtener los datos del personal.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmpleados();
    }, []);

    const handleMonthChange = async (empleadoId, nuevoMes) => {
        const val = nuevoMes === '' ? null : parseInt(nuevoMes, 10);
        try {
            const response = await programarVacacion(empleadoId, val);
            if (response.status === 'success') {
                // Actualizar localmente el estado de empleados
                setEmpleados(prev => prev.map(emp =>
                    emp.id === empleadoId ? { ...emp, mes_vacaciones: val } : emp
                ));

                // Mostrar alerta Toast fluida
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });
                Toast.fire({
                    icon: 'success',
                    title: 'Programacion actualizada'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error al programar',
                text: 'No se pudo guardar la programacion del mes de vacaciones.'
            });
        }
    };

    // Procesar colaboradores calculando antigüedad
    const processedEmpleados = empleados.map(emp => {
        const fechaIngresoDate = parseFechaLocal(emp.fecha_ingreso);
        const hoy = new Date();

        let tiempoAnios = 0;
        if (fechaIngresoDate) {
            const diffTime = hoy.getTime() - fechaIngresoDate.getTime();
            if (diffTime > 0) {
                tiempoAnios = Math.round((diffTime / (1000 * 60 * 60 * 24 * 365.25)) * 100) / 100;
            }
        }

        return {
            ...emp,
            tiempoAnios,
            isApto: tiempoAnios >= 1.0 // Un año continuo de servicio según Art. 177
        };
    });

    // Clasificar empleados por idoneidad
    const aptos = processedEmpleados.filter(e => e.isApto && e.estado === 'ACTIVO');
    const noElegibles = processedEmpleados.filter(e => (!e.isApto || e.estado !== 'ACTIVO'));

    // Filtrar la lista actual basada en pestaña activa, buscador y filtros
    const listadoActual = activeTab === 'aptos' ? aptos : noElegibles;

    const listadoFiltrado = listadoActual.filter(emp => {
        const matchesSearch = `${emp.nombres} ${emp.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.departamento.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesMes = filtroMes === 'todos' ||
            (filtroMes === 'no_asignado' && emp.mes_vacaciones === null) ||
            emp.mes_vacaciones === parseInt(filtroMes, 10);

        return matchesSearch && matchesMes;
    });

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
            {/* Cabecera */}
            <div className="flex flex-col items-center justify-center text-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Calendarizacion y Conciliacion de Vacaciones</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Establece y concilia de mutuo acuerdo el mes en que los empleados gozaran y cobraran su prestacion anual de vacaciones (Art. 177 - 189 del Codigo de Trabajo).
                    </p>
                </div>
            </div>

            {/* Tarjeta de Resumen Legal */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i className="bi bi-info-circle text-blue-600"></i>
                        Elegibilidad de Vacacion Ordinaria
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                        Todo trabajador tiene derecho a 15 dias calendario de vacaciones remuneradas al cumplir 1 ano continuo de servicios y haber trabajado al menos 200 dias. La prestacion equivale al salario ordinario de dicho lapso mas una prima del 30% de ley (factor 0.30 en total). El sistema automatizara el pago completo en la planilla del mes aqui calendarizado.
                    </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 font-mono text-xs rounded-xl p-3 border border-blue-100 dark:border-blue-900/30 whitespace-nowrap">
                    <span className="font-bold block">Formula de Ley:</span>
                    Monto = (Salario Base / 2) x 0.30
                </div>
            </div>

            {/* Pestañas de Navegacion */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                <button
                    onClick={() => { setActiveTab('aptos'); setFiltroMes('todos'); }}
                    className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'aptos'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <i className="bi bi-patch-check"></i>
                    Personal Apto ({aptos.length})
                </button>
                <button
                    onClick={() => { setActiveTab('no_elegibles'); setFiltroMes('todos'); }}
                    className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'no_elegibles'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <i className="bi bi-clock-history"></i>
                    Aun no elegibles o Inactivos ({noElegibles.length})
                </button>
            </div>

            {/* Controles de Filtrado */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                {/* Buscador */}
                <div className="relative w-full md:w-80">
                    <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Buscar por colaborador o cargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                </div>

                {/* Filtro por Mes de Vacaciones (solo para Aptos) */}
                {activeTab === 'aptos' && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Mes Programado:</label>
                        <select
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                        >
                            <option value="todos">Todos los meses</option>
                            <option value="no_asignado">Sin calendarizar</option>
                            {MESES.map(m => (
                                <option key={m.valor} value={m.valor}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Listado en Tabla */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="text-sm text-slate-500 mt-4">Obteniendo personal...</span>
                </div>
            ) : listadoFiltrado.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                    <i className="bi bi-folder2-open text-3xl text-slate-300 mb-2"></i>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No se encontraron colaboradores en esta lista.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="py-4 px-6">Colaborador</th>
                                    <th className="py-4 px-6">Cargo / Area</th>
                                    <th className="py-4 px-6">Fecha Ingreso</th>
                                    <th className="py-4 px-6 text-center">Antigüedad (Años)</th>
                                    {activeTab === 'aptos' ? (
                                        <th className="py-4 px-6">Mes de Vacaciones (Conciliado)</th>
                                    ) : (
                                        <th className="py-4 px-6 text-center">Motivo de no elegibilidad</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {listadoFiltrado.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-sm">
                                        {/* Colaborador */}
                                        <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                                            {emp.nombres} {emp.apellidos}
                                        </td>

                                        {/* Cargo */}
                                        <td className="py-4 px-6">
                                            <span className="block font-medium text-slate-700 dark:text-slate-300">{emp.cargo}</span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">{emp.departamento}</span>
                                        </td>

                                        {/* Fecha Ingreso */}
                                        <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">
                                            {formatFechaLocal(emp.fecha_ingreso)}
                                        </td>

                                        {/* Antigüedad */}
                                        <td className="py-4 px-6 text-center font-mono font-semibold">
                                            {emp.tiempoAnios}
                                        </td>

                                        {/* Acciones */}
                                        {activeTab === 'aptos' ? (
                                            <td className="py-4 px-6">
                                                <select
                                                    value={emp.mes_vacaciones || ''}
                                                    onChange={(e) => handleMonthChange(emp.id, e.target.value)}
                                                    className={`bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all ${emp.mes_vacaciones
                                                        ? 'border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400'
                                                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                                        }`}
                                                >
                                                    <option value="">-- No calendarizada --</option>
                                                    {MESES.map(m => (
                                                        <option key={m.valor} value={m.valor}>
                                                            {m.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        ) : (
                                            <td className="py-4 px-6 text-center">
                                                {emp.estado !== 'ACTIVO' ? (
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400">
                                                        Empleado Inactivo
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
                                                        Antigüedad menor a 1 año ({emp.tiempoAnios} años)
                                                    </span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default V2_ContenedorProgramacionVacaciones;
