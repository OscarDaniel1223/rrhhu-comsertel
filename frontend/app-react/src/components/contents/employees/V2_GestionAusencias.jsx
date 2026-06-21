import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getAusenciasIncapacidades, updateAusenciaIncapacidad } from '../../../services/employees/v2_ausenciaService';

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

const V2_GestionAusencias = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const response = await getAusenciasIncapacidades();
      if (response.status === 'success') {
        setSolicitudes(response.data);
      }
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron obtener las solicitudes de ausencias.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleResolver = async (solicitud, nuevoEstado) => {
    const actionText = nuevoEstado === 'APROBADA' ? 'APROBAR' : 'RECHAZAR';
    const confirmColor = nuevoEstado === 'APROBADA' ? '#16a34a' : '#dc2626';

    const result = await Swal.fire({
      title: `¿Confirmar resolución?`,
      text: `¿Está seguro de que desea ${actionText.toLowerCase()} esta solicitud de ausencia para el colaborador ${solicitud.empleado_nombres} ${solicitud.empleado_apellidos}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#64748b',
      confirmButtonText: `Sí, ${actionText.toLowerCase()}`,
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const payload = {
          id_empleado: solicitud.id_empleado,
          tipo: solicitud.tipo,
          fecha_inicio: solicitud.fecha_inicio.substring(0, 10),
          fecha_fin: solicitud.fecha_fin.substring(0, 10),
          motivo: solicitud.motivo,
          estado: nuevoEstado
        };
        const response = await updateAusenciaIncapacidad(solicitud.id, payload);
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: `Solicitud ${nuevoEstado === 'APROBADA' ? 'Aprobada' : 'Rechazada'}`,
            text: 'El estado de la solicitud se ha guardado correctamente.'
          });
          fetchSolicitudes();
        }
      } catch (error) {
        console.error('Error al resolver la solicitud:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un problema al actualizar la solicitud.'
        });
      }
    }
  };

  // Filtrado solo para las solicitudes pendientes
  const solicitudesFiltradas = solicitudes.filter((s) => {
    const cumpleVista = s.estado === 'PENDIENTE';

    const nombreCompleto = `${s.empleado_nombres} ${s.empleado_apellidos}`.toLowerCase();
    const cumpleBusqueda =
      nombreCompleto.includes(busqueda.toLowerCase()) ||
      s.empleado_dui.includes(busqueda) ||
      (s.motivo && s.motivo.toLowerCase().includes(busqueda.toLowerCase())) ||
      formatTipoText(s.tipo).toLowerCase().includes(busqueda.toLowerCase());

    return cumpleVista && cumpleBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* Controles de búsqueda */}
      <div className="flex justify-end">
        <div className="w-full md:w-80">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              placeholder="Buscar pendientes por colaborador, DUI..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-100 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Listado */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-4">Cargando solicitudes...</span>
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
            <i className="bi bi-check-circle text-2xl"></i>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">No hay solicitudes pendientes de aprobación en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solicitudesFiltradas.map((s) => {
            const fInicio = new Date(s.fecha_inicio).toLocaleDateString('es-SV', { timeZone: 'UTC' });
            const fFin = new Date(s.fecha_fin).toLocaleDateString('es-SV', { timeZone: 'UTC' });
            return (
              <div
                key={s.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between text-left"
              >
                <div className="space-y-4">
                  {/* Fila superior */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-950 dark:text-white text-base">
                        {s.empleado_nombres} {s.empleado_apellidos}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">DUI: {s.empleado_dui}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTipoBadge(s.tipo)}`}>
                      {formatTipoText(s.tipo)}
                    </span>
                  </div>

                  {/* Detalle Fechas */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 flex justify-between text-slate-700 dark:text-slate-300 text-sm border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Desde</span>
                      <span className="font-semibold">{fInicio}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Hasta</span>
                      <span className="font-semibold">{fFin}</span>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Motivo / Justificación</span>
                    <p className="text-slate-600 dark:text-slate-300 text-sm bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800 min-h-[48px] italic">
                      {s.motivo || 'No se registró ningún motivo descriptivo.'}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleResolver(s, 'RECHAZADA')}
                      className="py-2 px-4 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i className="bi bi-x-lg"></i>
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleResolver(s, 'APROBADA')}
                      className="py-2 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i className="bi bi-check-lg"></i>
                      Aprobar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default V2_GestionAusencias;
