import React, { useState, useEffect } from 'react';
import { getCargos, deleteCargo } from '../../../services/employees/v2_cargoService';
import { showError, showSuccess, showQuestion, showLoading } from '../../../utils/alerts';

const formatSalario = (salario) => {
  if (salario === null || salario === undefined) return '-';
  const num = parseFloat(salario);
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(num);
};

export default function V2_TablaCargo({ onEditCargo }) {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDepto, setFiltroDepto] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  const fetchCargos = async () => {
    setLoading(true);
    try {
      const response = await getCargos();
      if (response.status === 'success') {
        setCargos(response.data);
      }
    } catch (error) {
      console.error('Error al cargar cargos:', error);
      showError('No se pudieron cargar los cargos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const handleDelete = async (id) => {
    const result = await showQuestion(
      "¿Estas seguro de eliminar este cargo? Esta accion no se puede deshacer.",
      "Eliminar Cargo"
    );

    if (result.isConfirmed) {
      try {
        showLoading(true, "Procesando eliminacion...");
        await deleteCargo(id);
        showLoading(false);
        await showSuccess("El cargo ha sido eliminado correctamente.");
        fetchCargos();
      } catch (error) {
        showLoading(false);
        const errorMsg = error.response?.data?.message || 'Error al eliminar el cargo. Puede estar en uso por colaboradores.';
        showError(errorMsg);
      }
    }
  };

  // Obtener departamentos únicos de los cargos
  const departamentos = ['Todos', ...new Set(cargos.map(cargo => cargo.departamento).filter(Boolean))];

  // Filtrar cargos por búsqueda y departamento
  const filteredCargos = cargos.filter(cargo => {
    const cumpleDepto = filtroDepto === 'Todos' || cargo.departamento === filtroDepto;

    const termino = busqueda.toLowerCase().trim();
    if (!termino) return cumpleDepto;

    const cumpleBusqueda = cargo.titulo.toLowerCase().includes(termino) ||
      cargo.departamento.toLowerCase().includes(termino) ||
      cargo.salario_base.toString().includes(termino);

    return cumpleDepto && cumpleBusqueda;
  });

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <i className="bi bi-search absolute left-3 top-2.5 text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Buscar por titulo de cargo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent text-slate-700 dark:text-slate-100 transition-colors"
          />
        </div>
        <div className="w-full md:w-64 flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Area:</label>
          <select
            value={filtroDepto}
            onChange={(e) => setFiltroDepto(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent text-slate-700 dark:text-slate-100 transition-colors"
          >
            {departamentos.map((depto, idx) => (
              <option key={idx} value={depto}>{depto}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 text-sm">Cargando cargos...</p>
          </div>
        ) : filteredCargos.length === 0 ? (
          <div className="py-16 text-center">
            <i className="bi bi-person-workspace text-5xl text-slate-300 dark:text-slate-700 block mb-3"></i>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No se encontraron cargos en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Titulo de Cargo</th>
                  <th className="py-4 px-6">Area / Departamento</th>
                  <th className="py-4 px-6 text-right">Salario Base</th>
                  <th className="py-4 px-6 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-medium">
                {filteredCargos.map((cargo) => (
                  <tr key={cargo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-400">#{cargo.id}</td>
                    <td className="py-4 px-6 text-slate-800 dark:text-white font-bold">{cargo.titulo}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{cargo.departamento || '-'}</td>
                    <td className="py-4 px-6 text-right font-mono text-emerald-600 dark:text-emerald-400">{formatSalario(cargo.salario_base)}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditCargo(cargo)}
                          className="border border-blue-600 hover:bg-blue-50 text-blue-600 dark:border-white dark:text-white dark:hover:bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <i className="bi bi-pencil mr-1"></i>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(cargo.id)}
                          className="border border-red-600 hover:bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
