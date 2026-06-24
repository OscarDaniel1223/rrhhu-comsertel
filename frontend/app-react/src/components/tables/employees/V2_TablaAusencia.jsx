import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getAusenciasIncapacidades, updateAusenciaIncapacidad } from '../../../services/employees/v2_ausenciaService';
import { getEmpleados } from '../../../services/employees/v2_empleadoService';

const getTipoBadge = (tipo) => {
  switch (tipo) {
    case 'AUSENCIA_INJUSTIFICADA':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
    case 'PERMISO_GOCE':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
    case 'INCAPACIDAD_ISSS':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
  }
};

const formatTipoText = (tipo) => {
  switch (tipo) {
    case 'AUSENCIA_INJUSTIFICADA':
      return 'Ausencia Injustificada';
    case 'PERMISO_GOCE':
      return 'Permiso con Goce';
    case 'INCAPACIDAD_ISSS':
      return 'Incapacidad ISSS';
    default:
      return tipo;
  }
};

const getEstadoBadge = (estado) => {
  switch (estado) {
    case 'PENDIENTE':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
    case 'APROBADA':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50';
    case 'RECHAZADA':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
  }
};

const V2_TablaAusencia = ({ onEdit }) => {
  const [ausencias, setAusencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEmpleado, setFiltroEmpleado] = useState('Todos');
  const [filtroAnio, setFiltroAnio] = useState('Todos');
  const [filtroMes, setFiltroMes] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const meses = [
    { val: '01', label: 'Enero' },
    { val: '02', label: 'Febrero' },
    { val: '03', label: 'Marzo' },
    { val: '04', label: 'Abril' },
    { val: '05', label: 'Mayo' },
    { val: '06', label: 'Junio' },
    { val: '07', label: 'Julio' },
    { val: '08', label: 'Agosto' },
    { val: '09', label: 'Septiembre' },
    { val: '10', label: 'Octubre' },
    { val: '11', label: 'Noviembre' },
    { val: '12', label: 'Diciembre' }
  ];

  const aniosDisponibles = React.useMemo(() => {
    const years = new Set(ausencias.map(ai => {
      if (!ai.fecha_inicio) return new Date().getFullYear();
      return new Date(ai.fecha_inicio).getFullYear();
    }));
    const currentYear = new Date().getFullYear();
    years.add(currentYear);
    years.add(currentYear - 1);
    return Array.from(years).sort((a, b) => b - a);
  }, [ausencias]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const responseAusencias = await getAusenciasIncapacidades();
      if (responseAusencias.status === 'success') {
        setAusencias(responseAusencias.data);
      }

      const responseEmpleados = await getEmpleados();
      if (responseEmpleados.status === 'success') {
        setEmpleados(responseEmpleados.data);
      }
    } catch (error) {
      console.error('Error al cargar datos de ausencias:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los datos de ausencias e incapacidades.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCambioEstado = async (ausencia, nuevoEstado) => {
    const actionText = nuevoEstado === 'APROBADA' ? 'aprobar' : 'rechazar';
    const result = await Swal.fire({
      title: `¿Confirmar resolucion?`,
      text: `¿Esta seguro de que desea ${actionText} esta solicitud de ausencia/incapacidad?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00288e',
      cancelButtonColor: '#ba1a1a',
      confirmButtonText: 'Si, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          id_empleado: ausencia.id_empleado,
          tipo: ausencia.tipo,
          fecha_inicio: ausencia.fecha_inicio.substring(0, 10),
          fecha_fin: ausencia.fecha_fin.substring(0, 10),
          motivo: ausencia.motivo,
          estado: nuevoEstado
        };
        const response = await updateAusenciaIncapacidad(ausencia.id, payload);
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: '¡Resuelto!',
            text: `La solicitud ha sido marcada como ${nuevoEstado.toLowerCase()} exitosamente.`
          });
          fetchData();
        }
      } catch (error) {
        console.error('Error al actualizar estado:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estado de la solicitud.'
        });
      }
    }
  };



  // Filtrado y busqueda combinados
  const ausenciasFiltradas = ausencias.filter((ai) => {
    const cumpleFiltroEmpleado = filtroEmpleado === 'Todos' || String(ai.id_empleado) === filtroEmpleado;

    const cumpleAnio = filtroAnio === 'Todos' || (ai.fecha_inicio && ai.fecha_inicio.substring(0, 4) === filtroAnio);
    const cumpleMes = filtroMes === 'Todos' || (ai.fecha_inicio && ai.fecha_inicio.substring(5, 7) === filtroMes);

    const nombreCompleto = `${ai.empleado_nombres} ${ai.empleado_apellidos}`.toLowerCase();
    const cumpleBusqueda =
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      ai.empleado_dui.includes(busqueda) ||
      (ai.motivo && ai.motivo.toLowerCase().includes(busqueda.toLowerCase())) ||
      formatTipoText(ai.tipo).toLowerCase().includes(busqueda.toLowerCase());

    return cumpleFiltroEmpleado && cumpleAnio && cumpleMes && cumpleBusqueda;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-4 md:p-6 transition-colors">
      {/* Controles de Filtro y Busqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Filtrar por Colaborador */}
          <div className="flex flex-col gap-1 w-full sm:w-64">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Filtrar por Colaborador</label>
            <select
              value={filtroEmpleado}
              onChange={(e) => setFiltroEmpleado(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-100"
            >
              <option value="Todos">Todos los colaboradores</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.nombres} {emp.apellidos} ({emp.dui})
                </option>
              ))}
            </select>
          </div>

          {/* Filtrar por Año */}
          <div className="flex flex-col gap-1 w-full sm:w-32">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Año</label>
            <select
              value={filtroAnio}
              onChange={(e) => setFiltroAnio(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-100"
            >
              <option value="Todos">Todos</option>
              {aniosDisponibles.map((anio) => (
                <option key={anio} value={String(anio)}>
                  {anio}
                </option>
              ))}
            </select>
          </div>

          {/* Filtrar por Mes */}
          <div className="flex flex-col gap-1 w-full sm:w-44">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Mes</label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-100"
            >
              <option value="Todos">Todos los meses</option>
              {meses.map((m) => (
                <option key={m.val} value={m.val}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full md:w-80">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Buscar</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, DUI, tipo o motivo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4">Cargando registros...</span>
        </div>
      ) : ausenciasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <i className="bi bi-calendar-x text-2xl"></i>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No se encontraron registros de ausencias o incapacidades.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4 font-semibold">Colaborador</th>
                <th className="py-3 px-4 font-semibold">Tipo</th>
                <th className="py-3 px-4 font-semibold">Periodo</th>
                <th className="py-3 px-4 font-semibold">Motivo</th>
                <th className="py-3 px-4 font-semibold">Estado</th>
                <th className="py-3 px-4 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ausenciasFiltradas.map((ai) => {
                const fInicio = new Date(ai.fecha_inicio).toLocaleDateString('es-SV', { timeZone: 'UTC' });
                const fFin = new Date(ai.fecha_fin).toLocaleDateString('es-SV', { timeZone: 'UTC' });
                return (
                  <tr key={ai.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {ai.empleado_nombres} {ai.empleado_apellidos}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{ai.empleado_dui}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTipoBadge(ai.tipo)}`}>
                        {formatTipoText(ai.tipo)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div>{fInicio} al {fFin}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={ai.motivo}>
                      {ai.motivo || <span className="text-slate-400 italic">Sin motivo</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(ai.estado)}`}>
                        {ai.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(ai)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
                          title="Modificar Registro"
                        >
                          <i className="bi bi-pencil-fill text-sm"></i>
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

export default V2_TablaAusencia;
