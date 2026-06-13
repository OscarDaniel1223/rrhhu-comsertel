import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { createAusenciaIncapacidad, updateAusenciaIncapacidad } from '../services/v2_ausenciaService';
import { getEmpleados } from '../services/v2_empleadoService';

const V2_FormularioAusencia = ({ selectedIncidencia, onClearEdit }) => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_empleado: '',
    tipo: 'AUSENCIA_INJUSTIFICADA',
    fecha_inicio: '',
    fecha_fin: '',
    motivo: '',
  });

  useEffect(() => {
    if (selectedIncidencia) {
      setFormData({
        id_empleado: selectedIncidencia.id_empleado || '',
        tipo: selectedIncidencia.tipo || 'AUSENCIA_INJUSTIFICADA',
        fecha_inicio: selectedIncidencia.fecha_inicio ? selectedIncidencia.fecha_inicio.substring(0, 10) : '',
        fecha_fin: selectedIncidencia.fecha_fin ? selectedIncidencia.fecha_fin.substring(0, 10) : '',
        motivo: selectedIncidencia.motivo || '',
        estado: selectedIncidencia.estado || 'PENDIENTE'
      });
    } else {
      setFormData({
        id_empleado: '',
        tipo: 'AUSENCIA_INJUSTIFICADA',
        fecha_inicio: '',
        fecha_fin: '',
        motivo: '',
        estado: 'PENDIENTE'
      });
    }
  }, [selectedIncidencia]);

  useEffect(() => {
    const fetchEmpleados = async () => {
      try {
        const response = await getEmpleados();
        if (response.status === 'success') {
          // Filtrar solo empleados activos para registros nuevos
          const activos = response.data.filter(emp => emp.estado === 'ACTIVO');
          setEmpleados(activos);
        }
      } catch (error) {
        console.error('Error al cargar colaboradores:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los colaboradores.'
        });
      }
    };
    fetchEmpleados();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id_empleado || !formData.tipo || !formData.fecha_inicio || !formData.fecha_fin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor complete todos los campos obligatorios.'
      });
      return;
    }

    const inicio = new Date(formData.fecha_inicio);
    const fin = new Date(formData.fecha_fin);
    if (inicio > fin) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inconsistentes',
        text: 'La fecha de inicio no puede ser posterior a la fecha de fin.'
      });
      return;
    }

    setLoading(true);
    try {
      let response;
      if (selectedIncidencia) {
        response = await updateAusenciaIncapacidad(selectedIncidencia.id, formData);
      } else {
        response = await createAusenciaIncapacidad(formData);
      }

      if (response.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: selectedIncidencia
            ? 'La ausencia o incapacidad ha sido modificada correctamente.'
            : 'La ausencia o incapacidad ha sido registrada correctamente.'
        });
        if (onClearEdit) {
          onClearEdit();
        } else {
          setFormData({
            id_empleado: '',
            tipo: 'AUSENCIA_INJUSTIFICADA',
            fecha_inicio: '',
            fecha_fin: '',
            motivo: '',
            estado: 'PENDIENTE'
          });
        }
      }
    } catch (error) {
      console.error('Error al procesar ausencia:', error);
      const errorMsg = error.response?.data?.message || 'No se pudo completar el registro.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8 transition-colors">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Colaborador */}
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="id_empleado" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Colaborador <span className="text-red-500">*</span>
          </label>
          <select
            id="id_empleado"
            name="id_empleado"
            value={formData.id_empleado}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100"
          >
            <option value="">Seleccione un colaborador...</option>
            {empleados.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.nombres} {emp.apellidos} ({emp.dui})
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Incidencia */}
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="tipo" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Tipo de Incidencia <span className="text-red-500">*</span>
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100"
          >
            <option value="AUSENCIA_INJUSTIFICADA">Ausencia Injustificada (Descontada de Planilla)</option>
            <option value="PERMISO_GOCE">Permiso con Goce de Sueldo</option>
            <option value="INCAPACIDAD_ISSS">Incapacidad ISSS</option>
          </select>
        </div>

        {/* Fechas en Fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="fecha_inicio" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Fecha de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="fecha_inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="fecha_fin" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Fecha de Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="fecha_fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Estado Inicial */}
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="estado" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Estado de Aprobacion <span className="text-red-500">*</span>
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100"
          >
            <option value="PENDIENTE">Pendiente (Requiere resolucion)</option>
            <option value="APROBADA">Aprobada</option>
            <option value="RECHAZADA">Rechazada</option>
          </select>
        </div>

        {/* Motivo */}
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="motivo" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Motivo / Justificacion
          </label>
          <textarea
            id="motivo"
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            rows="3"
            placeholder="Describa de forma concisa el motivo o justificacion..."
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100 resize-none"
          ></textarea>
        </div>

        {/* Boton */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {selectedIncidencia && (
            <button
              type="button"
              onClick={onClearEdit}
              className="w-full sm:w-auto flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Cancelar Edición
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${selectedIncidencia ? 'flex-1' : 'w-full'}`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              selectedIncidencia ? 'Guardar Cambios' : 'Registrar Ausencia / Incapacidad'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default V2_FormularioAusencia;
