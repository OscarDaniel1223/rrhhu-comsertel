import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { createEmpleado } from '../services/v2_empleadoService';
import { getCargos } from '../services/v2_cargoService';

const V2_FormularioEmpleado = () => {
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
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los cargos.'
        });
      }
    };
    fetchCargos();
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

    // Validación de Formato Salvadoreño en Frontend
    const duiRegex = /^\d{8}-\d{1}$/;
    const nitRegex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;

    if (!duiRegex.test(formData.dui)) {
      Swal.fire({ icon: 'warning', title: 'DUI Inválido', text: 'El formato correcto es 00000000-0' });
      return;
    }

    if (!nitRegex.test(formData.nit)) {
      Swal.fire({ icon: 'warning', title: 'NIT Inválido', text: 'El formato correcto es 0000-000000-000-0' });
      return;
    }

    setLoading(true);
    try {
      const response = await createEmpleado(formData);
      if (response.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Empleado registrado correctamente.'
        });
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
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Hubo un error al registrar el empleado.';
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
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-slate-100">
      <h2 className="text-xl font-bold text-slate-800 mb-8 pb-3 border-b border-slate-100">Registro de Nuevo Empleado</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Nombres</label>
            <input 
              type="text" 
              name="nombres" 
              value={formData.nombres} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ej. Juan Carlos"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Apellidos</label>
            <input 
              type="text" 
              name="apellidos" 
              value={formData.apellidos} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Ej. Pérez García"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">DUI</label>
            <input 
              type="text" 
              name="dui" 
              value={formData.dui} 
              onChange={handleChange} 
              required 
              pattern="\d{8}-\d{1}"
              title="Debe contener 8 dígitos, un guion y 1 dígito (Ej: 12345678-9)"
              maxLength="10"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="00000000-0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">NIT</label>
            <input 
              type="text" 
              name="nit" 
              value={formData.nit} 
              onChange={handleChange} 
              required 
              pattern="\d{4}-\d{6}-\d{3}-\d{1}"
              title="Formato: 0000-000000-000-0"
              maxLength="17"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="0000-000000-000-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Fecha de Ingreso</label>
            <input 
              type="date" 
              name="fecha_ingreso" 
              value={formData.fecha_ingreso} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Cargo</label>
            <select 
              name="id_cargo" 
              value={formData.id_cargo} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
            >
              <option value="" disabled>Seleccione un cargo</option>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.titulo} ({cargo.departamento})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Estado</label>
            <select 
              name="estado" 
              value={formData.estado} 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
            >
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100 mt-8">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Empleado'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default V2_FormularioEmpleado;
