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
    <div className="bg-white p-6 md:p-8 rounded-[15px] shadow-sm border border-slate-200 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-black">Registro de Nuevo Empleado</h2>
        <p className="text-slate-500 text-xs mt-1">Completa los campos para dar de alta un nuevo colaborador en la base de datos.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Campo: Nombres */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-semibold text-slate-700">Nombres</label>
          <input 
            type="text" 
            name="nombres" 
            value={formData.nombres} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-2 border border-slate-200 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-slate-50/50 focus:bg-white"
            placeholder="Ej. Juan Carlos"
          />
        </div>

        {/* Campo: Apellidos */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-semibold text-slate-700">Apellidos</label>
          <input 
            type="text" 
            name="apellidos" 
            value={formData.apellidos} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-2 border border-slate-200 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-slate-50/50 focus:bg-white"
            placeholder="Ej. Pérez García"
          />
        </div>

        {/* Campo: DUI */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-semibold text-slate-700">DUI</label>
          <input 
            type="text" 
            name="dui" 
            value={formData.dui} 
            onChange={handleChange} 
            required 
            pattern="\d{8}-\d{1}"
            title="Debe contener 8 dígitos, un guion y 1 dígito (Ej: 12345678-9)"
            maxLength="10"
            className="w-full px-4 py-2 border border-slate-200 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-slate-50/50 focus:bg-white"
            placeholder="00000000-0"
          />
        </div>

        {/* Campo: NIT */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-semibold text-slate-700">NIT</label>
          <input 
            type="text" 
            name="nit" 
            value={formData.nit} 
            onChange={handleChange} 
            required 
            pattern="\d{4}-\d{6}-\d{3}-\d{1}"
            title="Formato: 0000-000000-000-0"
            maxLength="17"
            className="w-full px-4 py-2 border border-slate-200 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-slate-50/50 focus:bg-white"
            placeholder="0000-000000-000-0"
          />
        </div>

        {/* Campo: Fecha de Ingreso */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-semibold text-slate-700">Fecha de Ingreso</label>
          <input 
            type="date" 
            name="fecha_ingreso" 
            value={formData.fecha_ingreso} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-2 border border-slate-200 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-slate-50/50 focus:bg-white"
          />
        </div>

        {/* Campo: Cargo */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-semibold text-slate-700">Cargo</label>
          <select 
            name="id_cargo" 
            value={formData.id_cargo} 
            onChange={handleChange} 
            required
            className="w-full px-4 py-2 border border-slate-200 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
          >
            <option value="" disabled>Seleccione un cargo</option>
            {cargos.map((cargo) => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.titulo} ({cargo.departamento})
              </option>
            ))}
          </select>
        </div>

        {/* Campo: Estado */}
        <div className="flex flex-col gap-1.5">
          <label className="block text-sm font-semibold text-slate-700">Estado</label>
          <select 
            name="estado" 
            value={formData.estado} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-slate-200 rounded-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
          >
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
          </select>
        </div>

        {/* Botón de Guardado */}
        <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-[10px] transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? 'Guardando...' : 'Guardar Empleado'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default V2_FormularioEmpleado;
