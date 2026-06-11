import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getEmpleados, deleteEmpleado } from '../services/v2_empleadoService';

const getIniciales = (nombres, apellidos) => {
  const primeraNombre = nombres ? nombres.trim().charAt(0) : '';
  const primeraApellido = apellidos ? apellidos.trim().charAt(0) : '';
  return `${primeraNombre}${primeraApellido}`.toUpperCase();
};

const getAvatarColor = (nombre) => {
  const colores = [
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-indigo-50 text-indigo-700 border-indigo-200',
    'bg-slate-100 text-slate-700 border-slate-300',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'bg-amber-50 text-amber-700 border-amber-200',
  ];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colores.length;
  return colores[index];
};

const formatSalario = (salario) => {
  if (salario === null || salario === undefined) return '-';
  const num = parseFloat(salario);
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(num);
};

const V2_TablaEmpleado = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDepto, setFiltroDepto] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

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
      text: "Esta acción desactivará o eliminará al colaborador en la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00288e',
      cancelButtonColor: '#ba1a1a',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteEmpleado(id);
        Swal.fire({
          title: '¡Completado!',
          text: 'El estado del empleado ha sido actualizado.',
          icon: 'success',
          confirmButtonColor: '#00288e'
        });
        fetchEmpleados();
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Hubo un error al procesar la solicitud.'
        });
      }
    }
  };

  // Obtener departamentos únicos de forma dinámica
  const departamentos = ['Todos', ...new Set(empleados.map(emp => emp.departamento).filter(Boolean))];

  // Aplicar filtros de departamento y búsqueda
  const filteredEmpleados = empleados.filter(emp => {
    const cumpleDepto = filtroDepto === 'Todos' || emp.departamento === filtroDepto;
    
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return cumpleDepto;
    
    const nombreCompleto = `${emp.nombres} ${emp.apellidos}`.toLowerCase();
    const cumpleBusqueda = nombreCompleto.includes(termino) || 
                           (emp.dui && emp.dui.includes(termino)) ||
                           (emp.cargo && emp.cargo.toLowerCase().includes(termino));
                           
    return cumpleDepto && cumpleBusqueda;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900 mb-4"></div>
        <p className="text-sm font-medium text-slate-600">Cargando colaboradores...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar / Filtros */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1 sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <i className="bi bi-search"></i>
            </span>
            <input 
              type="text"
              placeholder="Buscar por nombre, DUI, cargo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder-slate-400"
            />
          </div>
          
          {/* Selector de Departamento */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">Dpto:</span>
            <select 
              value={filtroDepto}
              onChange={(e) => setFiltroDepto(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all cursor-pointer"
            >
              {departamentos.map(depto => (
                <option key={depto} value={depto}>{depto === 'Todos' ? 'Todos los Departamentos' : depto}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Contador */}
        <div className="text-sm text-slate-500 font-mono self-end md:self-auto">
          Mostrando <span className="font-bold text-slate-900">{filteredEmpleados.length}</span> de <span className="font-bold text-slate-900">{empleados.length}</span>
        </div>
      </div>

      {/* Modern List View (Flex-based) */}
      <div className="flex flex-col">
        {/* Table Header (Hidden on small screens, flex row on medium+) */}
        <div className="hidden md:flex items-center px-6 py-3 border-b border-slate-200 bg-slate-50/75 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div className="flex-[2] min-w-[200px]">Empleado</div>
          <div className="flex-1 min-w-[120px]">DUI</div>
          <div className="flex-[1.5] min-w-[160px]">Departamento</div>
          <div className="flex-[1.5] min-w-[180px]">Cargo</div>
          <div className="flex-1 min-w-[120px] text-right">Salario Base</div>
          <div className="flex-1 min-w-[100px] text-center">Estado</div>
          <div className="w-[100px] text-right">Acciones</div>
        </div>

        {/* Rows */}
        {filteredEmpleados.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="flex flex-col items-center justify-center space-y-2">
              <i className="bi bi-people text-4xl text-slate-300"></i>
              <p className="text-base font-semibold text-slate-700">No se encontraron colaboradores</p>
              <p className="text-xs text-slate-400">Intenta ajustar los filtros de búsqueda o departamento.</p>
            </div>
          </div>
        ) : (
          filteredEmpleados.map((emp) => {
            const isActivo = emp.estado === 'ACTIVO';
            const iniciales = getIniciales(emp.nombres, emp.apellidos);
            const avatarColor = getAvatarColor(`${emp.nombres} ${emp.apellidos}`);
            
            // Generar correo corporativo ficticio basado en sus nombres y apellidos
            const email = `${emp.nombres.split(' ')[0].toLowerCase()}.${emp.apellidos.split(' ')[0].toLowerCase()}@comsertel.com.sv`;

            return (
              <div 
                key={emp.id} 
                className={`flex flex-col md:flex-row md:items-center px-6 py-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors gap-4 md:gap-0 ${
                  !isActivo ? 'opacity-75 bg-slate-50/20' : ''
                }`}
              >
                {/* Empleado (Avatar, Nombre y Correo) */}
                <div className="flex-[2] min-w-[200px] flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 ${avatarColor}`}>
                    {iniciales}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{emp.nombres} {emp.apellidos}</div>
                    <div className="text-xs text-slate-500 truncate">{email}</div>
                  </div>
                </div>

                {/* DUI */}
                <div className="flex-1 min-w-[120px] font-mono text-sm text-slate-600">
                  <span className="inline md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">DUI</span>
                  {emp.dui}
                </div>

                {/* Departamento */}
                <div className="flex-[1.5] min-w-[160px] text-sm text-slate-800">
                  <span className="inline md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Departamento</span>
                  {emp.departamento || 'Sin asignar'}
                </div>

                {/* Cargo */}
                <div className="flex-[1.5] min-w-[180px] text-sm text-slate-800">
                  <span className="inline md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Cargo</span>
                  {emp.cargo || 'Sin asignar'}
                </div>

                {/* Salario Base */}
                <div className="flex-1 min-w-[120px] font-mono text-sm text-slate-900 md:text-right">
                  <span className="inline md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Salario Base</span>
                  {formatSalario(emp.salario_base)}
                </div>

                {/* Estado */}
                <div className="flex-1 min-w-[100px] md:text-center">
                  <span className="inline md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Estado</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isActivo 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {isActivo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Acciones */}
                <div className="w-[100px] flex items-center md:justify-end gap-2 text-slate-400">
                  <span className="inline md:hidden text-xs font-bold text-slate-400 uppercase tracking-wider block mr-2">Acciones</span>
                  <button 
                    onClick={() => Swal.fire({
                      title: 'Editar Colaborador',
                      text: 'La edición interactiva de colaboradores se habilitará en el siguiente sprint.',
                      icon: 'info',
                      confirmButtonColor: '#00288e'
                    })}
                    className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <i className="bi bi-pencil text-lg"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(emp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Desactivar o Eliminar"
                  >
                    <i className="bi bi-trash text-lg"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default V2_TablaEmpleado;

