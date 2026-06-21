import React, { useState } from 'react';
import V2_FormularioAusencia from './V2_FormularioAusencia';
import V2_TablaAusencia from '../../tables/employees/V2_TablaAusencia';
import V2_GestionAusencias from './V2_GestionAusencias';

const V2_ContenedorAusencia = () => {
  const [activeTab, setActiveTab] = useState('tabla');
  const [selectedIncidencia, setSelectedIncidencia] = useState(null);

  const handleEdit = (incidencia) => {
    setSelectedIncidencia(incidencia);
    setActiveTab('formulario');
  };

  const handleClearEdit = () => {
    setSelectedIncidencia(null);
  };

  return (
    <div className="m-4 md:m-6 py-4 space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white tracking-tight">Control de Ausencias e Incapacidades</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Gestiona el historial de inasistencias, permisos con goce y licencias medicas del personal.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 flex justify-center">
        <nav className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[15px]" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tabla')}
            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 cursor-pointer ${activeTab === 'tabla'
              ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
          >
            <i className="bi bi-calendar3 me-2"></i>
            Historial de Ausencias
          </button>

          <button
            onClick={() => setActiveTab('formulario')}
            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 cursor-pointer ${activeTab === 'formulario'
              ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
          >
            <i className="bi bi-calendar-plus me-2"></i>
            Registrar Incidencia
          </button>

          <button
            onClick={() => setActiveTab('pendientes')}
            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 cursor-pointer ${activeTab === 'pendientes'
              ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
              : 'text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
          >
            <i className="bi bi-clipboard-check me-2"></i>
            Pendientes de Aprobación
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'tabla' && (
          <V2_TablaAusencia onEdit={handleEdit} />
        )}
        {activeTab === 'formulario' && (
          <V2_FormularioAusencia
            selectedIncidencia={selectedIncidencia}
            onClearEdit={handleClearEdit}
          />
        )}
        {activeTab === 'pendientes' && (
          <V2_GestionAusencias />
        )}
      </div>
    </div>
  );
};

export default V2_ContenedorAusencia;
