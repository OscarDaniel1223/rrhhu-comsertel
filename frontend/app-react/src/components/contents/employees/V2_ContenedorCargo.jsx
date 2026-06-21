import React, { useState } from 'react';
import V2_FormularioCargo from './V2_FormularioCargo';
import V2_TablaCargo from '../../tables/employees/V2_TablaCargo';

export default function V2_ContenedorCargo() {
  const [activeTab, setActiveTab] = useState('tabla');
  const [selectedCargo, setSelectedCargo] = useState(null);

  return (
    <div className="m-4 md:m-6 py-4 space-y-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Gestión de Cargos</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Administra los roles, puestos de trabajo y salarios base del personal de forma centralizada.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8 flex justify-center">
        <nav className="flex space-x-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[15px]" aria-label="Tabs">
          <button
            onClick={() => {
              setSelectedCargo(null);
              setActiveTab('tabla');
            }}
            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 ${activeTab === 'tabla'
                ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
          >
            <i className="bi bi-table me-2"></i>
            Tabla de Cargos
          </button>

          <button
            onClick={() => {
              setSelectedCargo(null);
              setActiveTab('formulario');
            }}
            className={`whitespace-nowrap py-2.5 px-6 rounded-[15px] font-medium text-sm transition-all duration-300 ${activeTab === 'formulario'
                ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
          >
            <i className="bi bi-person-workspace me-2"></i>
            {selectedCargo ? 'Modificar Cargo' : 'Registrar Cargo'}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'tabla' ? (
          <V2_TablaCargo
            onEditCargo={(cargo) => {
              setSelectedCargo(cargo);
              setActiveTab('formulario');
            }}
          />
        ) : (
          <V2_FormularioCargo
            selectedCargo={selectedCargo}
            onClearEdit={() => {
              setSelectedCargo(null);
              setActiveTab('tabla');
            }}
          />
        )}
      </div>
    </div>
  );
}
