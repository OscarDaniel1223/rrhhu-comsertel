import BtnLogout from "./buttons/BtnLogout";
import { useState, useContext } from "react";
import user_icon from "../assets/usuario.png";
import { useAuth } from "../providers/AuthContext";
import { menuItems } from "../services/menuConfig";
import img_logo from "../assets/comsertel-banner-dash.png";
import { ThemeContext } from "../providers/ThemeContext";

export default function Navbar({ activeItem, handleItemClick }) {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const renderMenuItem = (item) => {
    const isActive = activeItem === item.id;
    // Si no tiene icono configurado, se renderiza un pequeño círculo centrado como viñeta
    const iconClass = item.icon ? item.icon : "bi-circle-fill text-[6px]";

    return (
      <button
        key={item.id}
        className={`flex items-center w-full px-5 py-3 text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-white border-r-4 border-blue-600 dark:border-white"
            : "text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
        }`}
        onClick={() => {
          handleItemClick(item.id);
          setShowMenu(false);
        }}
      >
        <i
          className={`bi ${iconClass} text-lg w-6 h-6 flex items-center justify-center mr-3 ${
            isActive ? "text-blue-600 dark:text-white" : "text-slate-400 dark:text-white/60"
          }`}
        ></i>
        {item.label}
        {isActive && (
          <i className="bi bi-chevron-right ml-auto text-sm text-blue-600 dark:text-white"></i>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Botón hamburguesa visible solo en móviles */}
      <button
        className="lg:hidden fixed top-4 right-4 z-[1051] p-2 bg-white dark:bg-slate-800 rounded-md shadow-md text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        onClick={() => setShowMenu(true)}
      >
        <i className="bi bi-list text-2xl"></i>
      </button>

      {/* Overlay oscuro en móviles */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[1039] lg:hidden" 
          onClick={() => setShowMenu(false)}
        ></div>
      )}

      {/* Sidebar / Offcanvas */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[1040] transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none lg:translate-x-0 ${showMenu ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h5 className="font-semibold text-slate-800 dark:text-white m-0">Menú</h5>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-700 dark:text-white dark:hover:text-white p-1"
            onClick={() => setShowMenu(false)}
          >
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <div id="nav_contenedor" className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-center border-b border-slate-100">
              <img
                src={img_logo}
                alt="Logo de empresa"
                className="w-full h-[120px] object-cover"
              />
            </div>
            <div className="flex items-center gap-3 p-4 text-left border-b border-slate-100 dark:border-slate-800">
              <img
                src={user_icon}
                alt="Icono de usuario"
                className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700"
              />
              <p className="text-sm font-semibold text-slate-800 dark:text-white m-0 truncate">{user?.name || 'Usuario'}</p>
            </div>
            
            <div className="flex flex-col py-2">
              {menuItems
                .filter(item => item.rol.includes(String(user?.rol)) && !item.config && !item.submenu)
                .map(renderMenuItem)}
            </div>

            {/*MENU DE EMPLEADOS PARA RRHH*/}
            {(user?.rol == 1 || user?.rol == 3) && (
              <div className="mt-2">
                <h6 className="px-5 mb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-white uppercase text-left m-0 flex items-center">
                  <i className="bi bi-people text-sm mr-2"></i> Empleados
                </h6>
                <div className="flex flex-col">
                  {menuItems
                    .filter(item => item.rol.includes(String(user?.rol)) && item.empleados === true)
                    .map(renderMenuItem)}
                </div>
              </div>
            )}

            {/*MENU DE PLANILLAS PARA RRHH*/}
            {(user?.rol == 1 || user?.rol == 3) && (
              <div className="mt-4">
                <h6 className="px-5 mb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-white uppercase text-left m-0 flex items-center">
                  <i className="bi bi-calculator text-sm mr-2"></i> Planillas
                </h6>
                <div className="flex flex-col">
                  {menuItems
                    .filter(item => item.rol.includes(String(user?.rol)) && item.planillas === true)
                    .map(renderMenuItem)}
                </div>
              </div>
            )}

            {/*MENU DE CONFIGURACION GENERAL*/}
            <div className="mt-4 mb-6">
              <h6 className="px-5 mb-2 text-[10px] font-bold tracking-wider text-slate-400 dark:text-white uppercase text-left m-0 flex items-center">
                <i className="bi bi-gear text-sm mr-2"></i> Configuraciones
              </h6>
              <div className="flex flex-col">
                {menuItems
                  .filter(item => item.rol.includes(String(user?.rol)) && item.config === true)
                  .map(renderMenuItem)}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 mt-auto">
            <BtnLogout />
            <button 
              className="mt-3 w-full py-2 px-4 rounded-lg border border-blue-600 dark:border-white text-blue-600 dark:text-white hover:bg-blue-50 dark:hover:bg-white/10 hover:text-blue-700 dark:hover:text-white font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer" 
              onClick={() => setDarkMode(!darkMode)}
            >
              <i className={`bi ${darkMode ? 'bi-moon-fill' : 'bi-sun-fill'} text-sm`}></i>
              {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
