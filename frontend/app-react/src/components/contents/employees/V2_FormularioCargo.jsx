import React, { useState, useEffect } from 'react';
import { createCargo, updateCargo } from '../../../services/employees/v2_cargoService';
import { getDepartamentos } from '../../../services/employees/v2_departamentoService';
import { showError, showSuccess, showQuestion, showLoading } from '../../../utils/alerts';

export default function V2_FormularioCargo({ selectedCargo, onClearEdit }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDeptos, setLoadingDeptos] = useState(true);
  const [formData, setFormData] = useState({
    titulo: '',
    salario_base: '',
    id_departamento: ''
  });

  // Cargar departamentos para el select
  useEffect(() => {
    const fetchDeptos = async () => {
      setLoadingDeptos(true);
      try {
        const response = await getDepartamentos();
        if (response.status === 'success') {
          setDepartamentos(response.data);
        }
      } catch (error) {
        console.error('Error al cargar departamentos:', error);
        showError('No se pudieron cargar los departamentos.');
      } finally {
        setLoadingDeptos(false);
      }
    };
    fetchDeptos();
  }, []);

  // Llenar el formulario si se pasa un cargo para edicion
  useEffect(() => {
    if (selectedCargo) {
      setFormData({
        titulo: selectedCargo.titulo || '',
        salario_base: selectedCargo.salario_base || '',
        id_departamento: selectedCargo.id_departamento || ''
      });
    } else {
      setFormData({
        titulo: '',
        salario_base: '',
        id_departamento: ''
      });
    }
  }, [selectedCargo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim() || !formData.salario_base || !formData.id_departamento) {
      showError('Todos los campos son obligatorios.');
      return;
    }

    if (Number(formData.salario_base) < 365.00) {
      showError('El salario base no puede ser menor al salario mínimo legal de $365.00 USD.');
      return;
    }

    setLoading(true);
    try {
      showLoading(true, selectedCargo ? 'Actualizando cargo...' : 'Registrando cargo...');
      let response;
      if (selectedCargo) {
        response = await updateCargo(selectedCargo.id, formData);
      } else {
        response = await createCargo(formData);
      }

      showLoading(false);
      if (response.status === 'success') {
        await showSuccess(
          selectedCargo
            ? 'Cargo modificado correctamente.'
            : 'Cargo registrado correctamente.'
        );
        if (onClearEdit) {
          onClearEdit();
        }
      }
    } catch (error) {
      showLoading(false);
      const errorMsg = error.response?.data?.message || 'Error al procesar la solicitud.';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm max-w-xl mx-auto">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-left">
        <h3 className="font-bold text-slate-800 dark:text-white text-md uppercase tracking-wider m-0">
          {selectedCargo ? 'Modificar Cargo' : 'Registrar Nuevo Cargo'}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
          {selectedCargo ? 'Edita los datos del cargo organizacional existente.' : 'Crea un nuevo cargo definiendo su area y salario base.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 text-left">
        {/* Titulo del cargo */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="titulo" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Titulo de Cargo
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            placeholder="Ej. Soporte Tecnico Especialista"
            value={formData.titulo}
            onChange={handleChange}
            required
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent text-slate-800 dark:text-white w-full transition-colors"
          />
        </div>

        {/* Salario Base */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="salario_base" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Salario Base Mensual (USD)
          </label>
          <input
            type="number"
            id="salario_base"
            name="salario_base"
            step="0.01"
            min="365.00"
            placeholder="Minimo $365.00"
            value={formData.salario_base}
            onChange={handleChange}
            required
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent text-slate-800 dark:text-white w-full transition-colors font-mono"
          />
        </div>

        {/* Area / Departamento */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="id_departamento" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Area / Departamento Organizacional
          </label>
          <select
            id="id_departamento"
            name="id_departamento"
            value={formData.id_departamento}
            onChange={handleChange}
            required
            disabled={loadingDeptos}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent text-slate-800 dark:text-white w-full transition-colors"
          >
            <option value="" disabled>Seleccione un area...</option>
            {departamentos.map((depto) => (
              <option key={depto.id} value={depto.id}>{depto.nombre}</option>
            ))}
          </select>
        </div>

        {/* Acciones */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClearEdit}
            className="border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            {selectedCargo ? 'Cancelar Edicion' : 'Volver a la Lista'}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <i className={`bi ${selectedCargo ? 'bi-check2' : 'bi-plus-lg'}`}></i>
                {selectedCargo ? 'Guardar Cambios' : 'Registrar Cargo'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
