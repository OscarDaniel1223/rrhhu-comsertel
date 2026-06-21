import React, { useState, useEffect } from 'react';
import { createEmpleado, updateEmpleado } from '../../../services/employees/v2_empleadoService';
import { getCargos } from '../../../services/employees/v2_cargoService';
import { showError, showSuccess, showQuestion, showLoading } from '../../../utils/alerts';

const V2_FormularioEmpleado = ({ selectedEmpleado, onClearEdit }) => {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dui: '',
    nit: '',
    nombres: '',
    apellidos: '',
    fecha_ingreso: '',
    id_cargo: '',
    estado: 'ACTIVO'
  });

  useEffect(() => {
    const fetchCargos = async () => {
      try {
        const response = await getCargos();
        if (response.status === 'success') {
          setCargos(response.data);
        }
      } catch (error) {
        console.error('Error al cargar cargos:', error);
        showError('No se pudieron cargar los cargos.');
      }
    };
    fetchCargos();
  }, []);

  // Llenar el formulario si se pasa un empleado para edicion
  useEffect(() => {
    if (selectedEmpleado) {
      setFormData({
        dui: selectedEmpleado.dui || '',
        nit: selectedEmpleado.nit || '',
        nombres: selectedEmpleado.nombres || '',
        apellidos: selectedEmpleado.apellidos || '',
        fecha_ingreso: selectedEmpleado.fecha_ingreso ? selectedEmpleado.fecha_ingreso.substring(0, 10) : '',
        id_cargo: selectedEmpleado.id_cargo || '',
        estado: selectedEmpleado.estado || 'ACTIVO'
      });
    } else {
      setFormData({
        dui: '',
        nit: '',
        nombres: '',
        apellidos: '',
        fecha_ingreso: '',
        id_cargo: '',
        estado: 'ACTIVO'
      });
    }
  }, [selectedEmpleado]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validacion de Formato Salvadorenio en Frontend
    const duiRegex = /^\d{8}-\d{1}$/;
    const nitRegex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;

    if (!duiRegex.test(formData.dui)) {
      showError('El formato de DUI es incorrecto (Ej. 00000000-0).');
      return;
    }

    if (!nitRegex.test(formData.nit)) {
      showError('El formato de NIT es incorrecto (Ej. 0000-000000-000-0).');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (selectedEmpleado) {
        response = await updateEmpleado(selectedEmpleado.id, formData);
      } else {
        response = await createEmpleado(formData);
      }

      if (response.status === 'success') {
        await showSuccess(
          selectedEmpleado
            ? 'Colaborador modificado correctamente.'
            : 'Colaborador registrado correctamente.'
        );
        if (onClearEdit) {
          onClearEdit();
        } else {
          setFormData({
            dui: '',
            nit: '',
            nombres: '',
            apellidos: '',
            fecha_ingreso: '',
            id_cargo: '',
            estado: 'ACTIVO'
          });
        }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Hubo un error al procesar el registro.';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8 transition-colors">
      <div className="mb-6 text-left border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {selectedEmpleado ? 'Modificacion de Empleado' : 'Registro de Nuevo Empleado'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          {selectedEmpleado ? 'Modifica los campos del colaborador seleccionado.' : 'Completa los campos para dar de alta un nuevo colaborador en la base de datos.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Fila 1: Nombres y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombres */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="nombres" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Nombres <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Ej. Juan Carlos"
            />
          </div>

          {/* Apellidos */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="apellidos" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Apellidos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Ej. Perez Garcia"
            />
          </div>
        </div>

        {/* Fila 2: DUI y NIT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* DUI */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="dui" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              DUI <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="dui"
              name="dui"
              value={formData.dui}
              onChange={handleChange}
              required
              pattern="\d{8}-\d{1}"
              title="Debe contener 8 digitos, un guion y 1 digito (Ej: 12345678-9)"
              maxLength="10"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="00000000-0"
            />
          </div>

          {/* NIT */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="nit" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              NIT <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nit"
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              required
              pattern="\d{4}-\d{6}-\d{3}-\d{1}"
              title="Formato: 0000-000000-000-0"
              maxLength="17"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="0000-000000-000-0"
            />
          </div>
        </div>

        {/* Fila 3: Fecha de Ingreso y Cargo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha de Ingreso */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="fecha_ingreso" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Fecha de Ingreso <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="fecha_ingreso"
              name="fecha_ingreso"
              value={formData.fecha_ingreso}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100"
            />
          </div>

          {/* Cargo */}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="id_cargo" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Cargo <span className="text-red-500">*</span>
            </label>
            <select
              id="id_cargo"
              name="id_cargo"
              value={formData.id_cargo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100 cursor-pointer"
            >
              <option value="" disabled className="dark:bg-slate-800">Seleccione un cargo...</option>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={cargo.id} className="dark:bg-slate-800">
                  {cargo.titulo} ({cargo.departamento})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila 4: Estado */}
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="estado" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-100 cursor-pointer"
          >
            <option value="ACTIVO" className="dark:bg-slate-800">ACTIVO</option>
            <option value="INACTIVO" className="dark:bg-slate-800">INACTIVO</option>
          </select>
        </div>

        {/* Botones de Accion */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {selectedEmpleado && (
            <button
              type="button"
              onClick={onClearEdit}
              className="w-full sm:w-auto flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Cancelar Edicion
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${selectedEmpleado ? 'flex-1' : 'w-full'}`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              selectedEmpleado ? 'Guardar Cambios' : 'Guardar Empleado'
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default V2_FormularioEmpleado;
