import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getEmpleados, deleteEmpleado } from '../services/v2_empleadoService';

const V2_TablaEmpleado = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmpleados = async () => {
    setLoading(true);
    try {
      const response = await getEmpleados();
      if (response.status === 'success') {
        setEmpleados(response.data);
      }
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los empleados.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteEmpleado(id);
        Swal.fire('Eliminado!', 'El empleado ha sido eliminado.', 'success');
        fetchEmpleados();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Hubo un error al eliminar el empleado.'
        });
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando empleados...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/75">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Empleado</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Documentos</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargo y Dpto</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingreso</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {empleados.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-sm text-slate-500">
                  No hay empleados registrados.
                </td>
              </tr>
            ) : (
              empleados.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-800">{emp.nombres} {emp.apellidos}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm text-slate-600">DUI: {emp.dui}</div>
                    <div className="text-xs text-slate-400 mt-0.5">NIT: {emp.nit}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm text-slate-800">{emp.cargo}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{emp.departamento}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600">
                    {new Date(emp.fecha_ingreso).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      emp.estado === 'ACTIVO' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {emp.estado}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-600 hover:text-red-900 focus:outline-none transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      <i className="bi bi-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default V2_TablaEmpleado;
