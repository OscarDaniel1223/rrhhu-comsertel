import React, { useState } from 'react';
import V2_FormularioEmpleado from './V2_FormularioEmpleado';
import V2_TablaEmpleado from './V2_TablaEmpleado';

const V2_ContenedorEmpleado = () => {
  const [activeTab, setActiveTab] = useState('tabla');

  return (
    <div className="py-6 px-4 md:px-6 lg:px-8">
      <div className="mb-8 flex flex-col items-center justify-center gap-4 text-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestión de Empleados</h1>
          <p className="text-slate-500 text-base mt-2">Administra la información del personal de la empresa de forma centralizada.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 flex justify-center">
        <nav className="flex space-x-2 bg-slate-100 p-1.5 rounded-[15px]" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('tabla')}
            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 ${
              activeTab === 'tabla'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-500 hover:text-black hover:bg-slate-200/50'
            }`}
          >
            <i className="bi bi-table me-2"></i>
            Tabla de Empleados
          </button>
          
          <button
            onClick={() => setActiveTab('formulario')}
            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 ${
              activeTab === 'formulario'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-500 hover:text-black hover:bg-slate-200/50'
            }`}
          >
            <i className="bi bi-person-plus me-2"></i>
            Registrar Empleado
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'tabla' ? <V2_TablaEmpleado /> : <V2_FormularioEmpleado />}
      </div>
    </div>
  );
};

export default V2_ContenedorEmpleado;
