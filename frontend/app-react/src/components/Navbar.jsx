import BtnLogout from "./buttons/BtnLogout";
import { useState, useContext } from "react";
import user_icon from "../assets/usuario.png";
import { useAuth } from "../providers/AuthContext";
import { menuItems } from "../services/menuConfig";
import img_logo from "../assets/comsertel-banner.png";
import { ThemeContext } from "../providers/ThemeContext";

export default function Navbar({ activeItem, handleItemClick }) {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <>
      {/* Botón hamburguesa visible solo en móviles */}
      <button
        className="lg:hidden fixed top-4 right-4 z-[1051] p-2 bg-white rounded-md shadow-md text-slate-700 hover:bg-slate-50 transition-colors"
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
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-[1040] transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none lg:translate-x-0 ${showMenu ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100">
          <h5 className="font-semibold text-slate-800 m-0">Menú</h5>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-700 p-1"
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
            <div className="flex items-center gap-3 p-4 text-left border-b border-slate-100">
              <img
                src={user_icon}
                alt="Icono de usuario"
                className="w-12 h-12 rounded-full border border-slate-200"
              />
              <p className="text-sm font-semibold text-slate-800 m-0 truncate">{user?.name || 'Usuario'}</p>
            </div>
            
            <div className="flex flex-col py-2">
              {menuItems
                .filter(item => item.rol.includes(String(user?.rol)) && !item.config && !item.submenu)
                .map(item => (
                  <button
                    key={item.id}
                    className={`flex items-center w-full px-5 py-3 text-sm font-medium transition-colors ${activeItem === item.id ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                    onClick={() => {
                      handleItemClick(item.id);
                      setShowMenu(false);
                    }}
                  >
                    <i className={`${item.icon} text-lg w-6 mr-3 text-left ${activeItem === item.id ? "text-blue-600" : "text-slate-400"}`}></i>
                    {item.label}
                    {activeItem === item.id && <i className="bi bi-chevron-right ml-auto text-blue-600"></i>}
                  </button>
                ))}
            </div>

            {/*MENU DE EMPLEADOS PARA RRHH*/}
            {(user?.rol == 1 || user?.rol == 3) && (
              <div className="mt-2">
                <h6 className="px-5 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase text-left m-0">
                  <i className="bi bi-people mr-2"></i> Empleados
                </h6>
                <div className="flex flex-col">
                  {menuItems
                    .filter(item => item.rol.includes(String(user?.rol)) && item.empleados === true)
                    .map(item => (
                      <button
                        key={item.id}
                        className={`flex items-center w-full px-5 py-2.5 text-sm font-medium transition-colors ${activeItem === item.id ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                        onClick={() => {
                          handleItemClick(item.id);
                          setShowMenu(false);
                        }}
                      >
                        <i className={`${item.icon} text-lg w-6 mr-3 text-left ${activeItem === item.id ? "text-blue-600" : "text-slate-400"}`}></i>
                        {item.label}
                        {activeItem === item.id && <i className="bi bi-chevron-right ml-auto text-blue-600"></i>}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/*MENU DE PLANILLAS PARA RRHH*/}
            {(user?.rol == 1 || user?.rol == 3) && (
              <div className="mt-4">
                <h6 className="px-5 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase text-left m-0">
                  <i className="bi bi-calculator mr-2"></i> Planillas
                </h6>
                <div className="flex flex-col">
                  {menuItems
                    .filter(item => item.rol.includes(String(user?.rol)) && item.planillas === true)
                    .map(item => (
                      <button
                        key={item.id}
                        className={`flex items-center w-full px-5 py-2.5 text-sm font-medium transition-colors ${activeItem === item.id ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                        onClick={() => {
                          handleItemClick(item.id);
                          setShowMenu(false);
                        }}
                      >
                        <i className={`${item.icon} text-lg w-6 mr-3 text-left ${activeItem === item.id ? "text-blue-600" : "text-slate-400"}`}></i>
                        {item.label}
                        {activeItem === item.id && <i className="bi bi-chevron-right ml-auto text-blue-600"></i>}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/*MENU DE CONFIGURACION GENERAL*/}
            <div className="mt-4 mb-6">
              <h6 className="px-5 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase text-left m-0">
                <i className="bi bi-gear mr-2"></i> Configuraciones
              </h6>
              <div className="flex flex-col">
                {menuItems
                  .filter(item => item.rol.includes(String(user?.rol)) && item.config === true)
                  .map(item => (
                    <button
                      key={item.id}
                      className={`flex items-center w-full px-5 py-2.5 text-sm font-medium transition-colors ${activeItem === item.id ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                      onClick={() => {
                        handleItemClick(item.id);
                        setShowMenu(false);
                      }}
                    >
                      <i className={`${item.icon} text-lg w-6 mr-3 text-left ${activeItem === item.id ? "text-blue-600" : "text-slate-400"}`}></i>
                      {item.label}
                      {activeItem === item.id && <i className="bi bi-chevron-right ml-auto text-blue-600"></i>}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
            <BtnLogout />
            <button 
              className="mt-3 w-full py-2 px-4 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer" 
              onClick={() => setDarkMode(!darkMode)}
            >
              <i className={`bi ${darkMode ? 'bi-moon-fill' : 'bi-sun-fill'}`}></i>
              {darkMode ? 'Modo Oscuro' : 'Modo Claro'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
