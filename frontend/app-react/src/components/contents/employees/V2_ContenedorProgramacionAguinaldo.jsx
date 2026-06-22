import React, { useState, useEffect } from 'react';
import { getEmpleados, programarAguinaldo } from '../../../services/employees/v2_empleadoService';
import Swal from 'sweetalert2';

const parseFechaLocal = (f) => {
    if (!f) return null;
    const d = new Date(f);
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

// Validación de fecha para rango permitido de aguinaldos (20 de Octubre al 20 de Diciembre)
const esFechaValidaAguinaldo = (fechaStr) => {
    if (!fechaStr) return false;
    const date = new Date(fechaStr + 'T00:00:00');
    if (isNaN(date.getTime())) return false;
    
    const anio = date.getFullYear();
    const inicioRango = new Date(`${anio}-10-20T00:00:00`);
    const finRango = new Date(`${anio}-12-20T00:00:00`);
    
    return date >= inicioRango && date <= finRango;
};

const V2_ContenedorProgramacionAguinaldo = () => {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false); // Estado de carga para operaciones masivas
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('activos'); // 'activos' o 'inactivos'
    const [filtroMes, setFiltroMes] = useState('todos');

    // Estados para asignación masiva
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkDate, setBulkDate] = useState('');

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
                text: 'No se pudieron obtener los datos de los empleados para la programación de aguinaldos.'
            });
        } finally {
            setLoading(false);
            setSelectedIds([]); // Limpiar selección
        }
    };

    useEffect(() => {
        fetchEmpleados();
    }, []);

    useEffect(() => {
        setSelectedIds([]);
    }, [activeTab, filtroMes]);

    const handleDateChange = async (empleadoId, nuevaFecha) => {
        const val = nuevaFecha === '' ? null : nuevaFecha;
        
        // Validar rango legal en la edición individual
        if (val !== null && !esFechaValidaAguinaldo(val)) {
            Swal.fire({
                icon: 'error',
                title: 'Fecha fuera de rango legal',
                text: 'El pago del aguinaldo solo se puede calendarizar entre el 20 de octubre y el 20 de diciembre de cada año.'
            });
            return;
        }

        try {
            const response = await programarAguinaldo(empleadoId, val);
            if (response.status === 'success') {
                setEmpleados(prev => prev.map(emp =>
                    emp.id === empleadoId ? { ...emp, fecha_aguinaldo: val } : emp
                ));

                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true
                });
                Toast.fire({
                    icon: 'success',
                    title: 'Fecha de pago de aguinaldo actualizada'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error al programar',
                text: 'No se pudo guardar la fecha programada para el aguinaldo.'
            });
        }
    };

    // Aplicar fecha de pago en lote (Asignación Masiva)
    const handleBulkApply = async (clearMode = false) => {
        if (selectedIds.length === 0) return;
        
        const targetDateStr = clearMode ? null : bulkDate;
        
        // Validar rango legal en la edición en lote
        if (!clearMode) {
            if (!bulkDate) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fecha requerida',
                    text: 'Por favor, selecciona una fecha válida en el panel de asignación masiva.'
                });
                return;
            }
            if (!esFechaValidaAguinaldo(bulkDate)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Fecha fuera de rango legal',
                    text: 'El pago del aguinaldo solo se puede calendarizar entre el 20 de octubre y el 20 de diciembre de cada año.'
                });
                return;
            }
        }

        const confirmTitle = clearMode ? '¿Limpiar fechas programadas?' : '¿Asignar fecha de aguinaldo?';
        const confirmText = clearMode 
            ? `Vas a remover la programación de aguinaldo para los ${selectedIds.length} empleados seleccionados. ¿Deseas continuar?`
            : `Vas a programar la fecha de pago de aguinaldo para el ${formatFechaLocal(bulkDate)} a los ${selectedIds.length} empleados seleccionados. ¿Deseas continuar?`;

        const resultConfirm = await Swal.fire({
            title: confirmTitle,
            text: confirmText,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b'
        });

        if (!resultConfirm.isConfirmed) return;

        setProcessing(true);
        try {
            // Promesas seguras e individuales que no abortan por fallas de un único empleado
            const promesas = selectedIds.map(async (id) => {
                try {
                    const res = await programarAguinaldo(id, targetDateStr);
                    return { id, status: 'success', res };
                } catch (err) {
                    console.error(`Error en lote para ID ${id}:`, err);
                    return { id, status: 'error', error: err };
                }
            });

            const resultados = await Promise.all(promesas);
            const exitosos = resultados.filter(r => r.status === 'success').length;

            if (exitosos > 0) {
                // Actualizar el estado localmente de los que fueron exitosos
                const idsExitosos = resultados.filter(r => r.status === 'success').map(r => r.id);
                setEmpleados(prev => prev.map(emp =>
                    idsExitosos.includes(emp.id) ? { ...emp, fecha_aguinaldo: targetDateStr } : emp
                ));

                Swal.fire({
                    icon: 'success',
                    title: 'Proceso completado',
                    text: `Se actualizó la fecha de aguinaldo para ${exitosos} de ${selectedIds.length} empleados con éxito.`
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de procesamiento',
                    text: 'No se pudo actualizar la fecha de pago para los empleados seleccionados.'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error masivo',
                text: 'Ocurrió un error inesperado al procesar el lote.'
            });
        } finally {
            setProcessing(false);
            setSelectedIds([]); // Limpiar checkboxes
            setBulkDate(''); // Limpiar fecha masiva
        }
    };

    // Selección individual
    const handleSelectRow = (empleadoId) => {
        setSelectedIds(prev =>
            prev.includes(empleadoId)
                ? prev.filter(id => id !== empleadoId)
                : [...prev, empleadoId]
        );
    };

    // Selección múltiple total
    const handleSelectAll = (checked, listadoVisible) => {
        if (checked) {
            const idsListado = listadoVisible.map(e => e.id);
            setSelectedIds(idsListado);
        } else {
            setSelectedIds([]);
        }
    };

    // Procesar colaboradores calculando antigüedad en años
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
            tiempoAnios
        };
    });

    // Clasificar empleados por estado
    const activos = processedEmpleados.filter(e => e.estado === 'ACTIVO');
    const inactivos = processedEmpleados.filter(e => e.estado !== 'ACTIVO');

    // Filtrar la lista actual basada en pestaña activa y buscador
    const listadoActual = activeTab === 'activos' ? activos : inactivos;

    const listadoFiltrado = listadoActual.filter(emp => {
        const matchesSearch = `${emp.nombres} ${emp.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.departamento.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesMes = true;
        if (filtroMes !== 'todos') {
            if (filtroMes === 'no_asignado') {
                matchesMes = emp.fecha_aguinaldo === null;
            } else if (emp.fecha_aguinaldo) {
                const date = new Date(emp.fecha_aguinaldo + 'T00:00:00');
                matchesMes = (date.getMonth() + 1) === parseInt(filtroMes, 10);
            } else {
                matchesMes = false;
            }
        }

        return matchesSearch && matchesMes;
    });

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

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Calendarizacion y Programacion de Aguinaldos</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Establece y define la fecha especifica de pago de aguinaldos para el personal. El sistema automatizara el calculo en la planilla del periodo que contenga dicha fecha (Art. 196 - 202 del Codigo de Trabajo).
                    </p>
                </div>
            </div>

            {/* Anuncio Informativo de Restricción Legal y UI */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl mb-6">
                <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm flex items-center gap-2">
                    <i className="bi bi-exclamation-triangle"></i>
                    Restriccion de Calendarizacion de Aguinaldos
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">
                    De acuerdo con el Articulo 200 del Codigo de Trabajo y las politicas de control interno de la empresa, la fecha de pago del aguinaldo solo se puede calendarizar en el rango del **20 de octubre al 20 de diciembre** de cada ano. El sistema validara y rechazara cualquier fecha fuera de este intervalo.
                </p>
            </div>

            {/* Tarjeta de Resumen Legal */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-5 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <i className="bi bi-info-circle text-blue-600"></i>
                        Elegibilidad y Calculo del Aguinaldo
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                        Los empleadores tienen la obligacion de pagar una prima en concepto de aguinaldo por cada ano de trabajo. El aguinaldo es proporcional al tiempo de servicio si el empleado tiene menos de un ano de antiguedad. El sistema calculara automaticamente la prestacion exenta y los tramos correspondientes segun el historial de ingreso y el salario base del empleado.
                    </p>
                </div>
            </div>

            {/* Panel de Asignación Masiva en Lote */}
            {activeTab === 'activos' && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm mb-6 transition-all duration-200">
                    <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <i className="bi bi-box-seam text-blue-600"></i>
                        Panel de Asignacion Masiva (Accion en lote)
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
                        <div className="flex flex-col gap-1 w-full sm:w-auto">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha de pago en lote:</label>
                            <input
                                type="date"
                                value={bulkDate}
                                onChange={(e) => setBulkDate(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => handleBulkApply(false)}
                                disabled={selectedIds.length === 0 || !bulkDate || processing}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all select-none cursor-pointer ${
                                    selectedIds.length > 0 && bulkDate && !processing
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                }`}
                            >
                                <i className="bi bi-calendar-check"></i>
                                Programar Seleccionados ({selectedIds.length})
                            </button>
                            <button
                                onClick={() => handleBulkApply(true)}
                                disabled={selectedIds.length === 0 || processing}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all select-none cursor-pointer ${
                                    selectedIds.length > 0 && !processing
                                        ? 'border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400'
                                        : 'border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                }`}
                            >
                                <i className="bi bi-trash"></i>
                                Limpiar Fechas
                            </button>
                        </div>
                        {selectedIds.length > 0 && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold ml-2 select-none animate-pulse">
                                {selectedIds.length} colaboradores seleccionados para edicion en lote
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Pestañas de Navegacion */}
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
                <button
                    onClick={() => { setActiveTab('activos'); }}
                    className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'activos'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <i className="bi bi-patch-check"></i>
                    Personal Activo ({activos.length})
                </button>
                <button
                    onClick={() => { setActiveTab('inactivos'); }}
                    className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'inactivos'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <i className="bi bi-person-x"></i>
                    Personal Inactivo ({inactivos.length})
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

                {/* Filtro por Mes de Pago */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Mes de Pago:</label>
                    <select
                        value={filtroMes}
                        onChange={(e) => setFiltroMes(e.target.value)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                        <option value="todos">Todos los meses</option>
                        <option value="no_assigned">Sin programar</option>
                        {MESES.map(m => (
                            <option key={m.valor} value={m.valor}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Listado en Tabla */}
            {loading || processing ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="text-sm text-slate-500 mt-4">
                        {processing ? 'Procesando cambios masivos en lote...' : 'Obteniendo personal...'}
                    </span>
                </div>
            ) : listadoFiltrado.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                    <i className="bi bi-folder2-open text-3xl text-slate-300 mb-2"></i>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No se encontraron colaboradores en esta lista.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider select-none">
                                    {activeTab === 'activos' && (
                                        <th className="py-4 px-6 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                checked={listadoFiltrado.length > 0 && selectedIds.length === listadoFiltrado.length}
                                                onChange={(e) => handleSelectAll(e.target.checked, listadoFiltrado)}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 transition-all"
                                            />
                                        </th>
                                    )}
                                    <th className="py-4 px-6">Colaborador</th>
                                    <th className="py-4 px-6">Cargo / Area</th>
                                    <th className="py-4 px-6">Fecha Ingreso</th>
                                    <th className="py-4 px-6 text-center">Antigüedad (Años)</th>
                                    <th className="py-4 px-6 text-center">Fecha de Pago Aguinaldo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {listadoFiltrado.map(emp => {
                                    const isSelected = selectedIds.includes(emp.id);
                                    return (
                                        <tr 
                                            key={emp.id} 
                                            className={`transition-colors text-sm ${
                                                isSelected 
                                                    ? 'bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/40 dark:hover:bg-blue-950/20' 
                                                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                                            }`}
                                        >
                                            {/* Checkbox de Selección Individual */}
                                            {activeTab === 'activos' && (
                                                <td className="py-4 px-6 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectRow(emp.id)}
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 transition-all"
                                                    />
                                                </td>
                                            )}

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
                                            <td className="py-4 px-6 text-center">
                                                {emp.estado === 'ACTIVO' ? (
                                                    <div className="flex justify-center items-center gap-2">
                                                        <input
                                                            type="date"
                                                            value={emp.fecha_aguinaldo ? emp.fecha_aguinaldo.split('T')[0] : ''}
                                                            onChange={(e) => handleDateChange(emp.id, e.target.value)}
                                                            className={`bg-slate-50 dark:bg-slate-900 border rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all ${emp.fecha_aguinaldo
                                                                ? 'border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 font-mono'
                                                                : 'border-slate-200 dark:border-slate-700 text-slate-500'
                                                                }`}
                                                        />
                                                        {emp.fecha_aguinaldo && (
                                                            <button
                                                                onClick={() => handleDateChange(emp.id, null)}
                                                                className="text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded border border-transparent hover:border-red-300 dark:hover:border-red-900/40 transition-all cursor-pointer"
                                                                title="Remover fecha programada"
                                                            >
                                                                Limpiar
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400">
                                                        Inactivo (No elegible)
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default V2_ContenedorProgramacionAguinaldo;
