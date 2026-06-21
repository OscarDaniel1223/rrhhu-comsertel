import React, { useState } from 'react';
import V2_FormularioEmpleado from './V2_FormularioEmpleado';
import V2_TablaEmpleado from '../../tables/employees/V2_TablaEmpleado';

const V2_ContenedorEmpleado = () => {
  const [activeTab, setActiveTab] = useState('tabla');
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);

  return (
    <div className="m-4 md:m-6 py-4 space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Gestión de Empleados</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Administra la información del personal de la empresa de forma centralizada.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 flex justify-center">
        <nav className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[15px]" aria-label="Tabs">
          <button
            onClick={() => {
              setSelectedEmpleado(null);
              setActiveTab('tabla');
            }}
            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 ${activeTab === 'tabla'
              ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
          >
            <i className="bi bi-table me-2"></i>
            Tabla de Empleados
          </button>

          <button
            onClick={() => {
              setSelectedEmpleado(null);
              setActiveTab('formulario');
            }}
            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 ${activeTab === 'formulario'
              ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
          >
            <i className="bi bi-person-plus me-2"></i>
            {selectedEmpleado ? 'Modificar Empleado' : 'Registrar Empleado'}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'tabla' ? (
          <V2_TablaEmpleado
            onEditEmpleado={(emp) => {
              setSelectedEmpleado(emp);
              setActiveTab('formulario');
            }}
          />
        ) : (
          <V2_FormularioEmpleado
            selectedEmpleado={selectedEmpleado}
            onClearEdit={() => {
              setSelectedEmpleado(null);
              setActiveTab('tabla');
            }}
          />
        )}
      </div>
    </div>
  );
};

export default V2_ContenedorEmpleado;
