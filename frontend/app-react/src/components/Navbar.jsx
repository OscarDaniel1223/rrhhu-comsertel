import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import user_icon from "../assets/usuario.png";
import { useAuth } from "../providers/AuthContext";
import { menuItems } from "../services/menuConfig";
import img_logo from "../assets/comsertel-banner-dash.png";
import { ThemeContext } from "../providers/ThemeContext";

export default function Navbar({ activeItem, handleItemClick }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      icon: "question",
      title: "Cerrar sesion",
      text: "Esta seguro de que quiere cerrar sesion?",
      showCancelButton: true,
      confirmButtonText: "Si, cerrar sesion",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/");
      }
    });
  };

  const renderMenuItem = (item) => {
    const isActive = activeItem === item.id;
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
      {/* Boton hamburguesa visible solo en moviles */}
      <button
        className="lg:hidden fixed top-4 right-4 z-[1051] p-2 bg-white dark:bg-slate-800 rounded-md shadow-md text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors print:hidden"
        onClick={() => setShowMenu(true)}
      >
        <i className="bi bi-list text-2xl"></i>
      </button>

      {/* Overlay oscuro en moviles */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-[1039] lg:hidden print:hidden"
          onClick={() => setShowMenu(false)}
        ></div>
      )}

      {/* Sidebar / Offcanvas */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[1040] transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none lg:translate-x-0 print:hidden ${
          showMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h5 className="font-semibold text-slate-800 dark:text-white m-0">Menu</h5>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-700 dark:text-white dark:hover:text-white p-1"
            onClick={() => setShowMenu(false)}
          >
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <div id="nav_contenedor" className="flex-1 flex flex-col overflow-y-auto justify-between">
          <div className="flex flex-col">
            <div className="flex items-center justify-center border-b border-slate-100">
              <img
                src={img_logo}
                alt="Logo de empresa"
                className="w-full h-[120px] object-cover"
              />
            </div>

            {/* Menu de navegacion principal */}
            <div className="flex flex-col py-2">
              {menuItems
                .filter(
                  (item) =>
                    item.rol.includes(String(user?.rol)) &&
                    !item.config &&
                    !item.submenu
                )
                .map(renderMenuItem)}
            </div>
          </div>

          {/* Seccion inferior: Configuraciones y Menu de Usuario */}
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2 mt-auto">
            {/* Boton de Configuraciones */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center w-full px-5 py-3 text-sm font-medium text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <i className="bi bi-gear text-lg w-6 h-6 flex items-center justify-center mr-3 text-slate-400 dark:text-white/60"></i>
              Configuraciones
              <i
                className={`bi bi-chevron-${
                  showSettings ? "up" : "down"
                } ml-auto text-xs text-slate-400 dark:text-white/40`}
              ></i>
            </button>

            {/* Submenu de configuraciones */}
            {showSettings && (
              <div className="flex flex-col py-1 gap-0.5 bg-slate-100/30 dark:bg-slate-800/20 rounded-md">
                {/* 1. Alternar Modo Oscuro */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center justify-between w-full pl-8 pr-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span className="flex items-center">
                    <i
                      className={`bi ${
                        darkMode ? "bi-moon-fill" : "bi-sun-fill"
                      } text-sm mr-2 text-slate-400 dark:text-white/60`}
                    ></i>
                    Modo {darkMode ? "Oscuro" : "Claro"}
                  </span>
                  <div
                    className={`w-8 h-4 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      darkMode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <div
                      className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        darkMode ? "translate-x-4" : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                </button>

                {/* 2. Lista de usuarios (cargados dinámicamente según rol) */}
                {menuItems
                  .filter(
                    (item) =>
                      item.rol.includes(String(user?.rol)) &&
                      item.config === true
                  )
                  .map((item) => {
                    const isActive = activeItem === item.id;
                    return (
                      <button
                        key={item.id}
                        className={`flex items-center w-full pl-8 pr-5 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-white border-r-4 border-blue-600 dark:border-white"
                            : "text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        onClick={() => {
                          handleItemClick(item.id);
                          setShowMenu(false);
                        }}
                      >
                        <i className={`bi ${item.icon} text-sm mr-2 text-slate-400 dark:text-white/60`}></i>
                        {item.label}
                      </button>
                    );
                  })}

                {/* 3. Boton de Soporte */}
                <button
                  onClick={() => {
                    setShowSupportModal(true);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full pl-8 pr-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <i className="bi bi-question-circle text-sm mr-2 text-slate-400 dark:text-white/60"></i>
                  Soporte
                </button>

                {/* 4. Cerrar sesion */}
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full pl-8 pr-5 py-2 text-xs font-medium text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <i className="bi bi-box-arrow-right text-sm mr-2 text-slate-400 dark:text-white/60"></i>
                  Cerrar Sesion
                </button>
              </div>
            )}
          </div>

          {/* Bloque del Usuario al Final (Avatar + Nombre - Solo informativo) */}
          <div className="flex items-center gap-3 w-full p-3 mt-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 rounded-lg">
            <img
              src={user_icon}
              alt="Icono de usuario"
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white m-0 truncate">
                {user?.name || "Usuario"}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-white/40 m-0 truncate">
                {user?.rol == 1 ? "Administrador" : "Empleado"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Soporte Tecnico (Nativo con Tailwind CSS) */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full overflow-hidden transform scale-100 transition-all duration-300 flex flex-col p-6 gap-4">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                  <i className="bi bi-headset text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Soporte Tecnico
                </h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Para asistencia tecnica, consultas sobre el funcionamiento del sistema o reportar cualquier tipo de falla, por favor pongase en contacto con nuestro equipo de administracion escribiendo al siguiente correo electronico:
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-lg text-center font-mono text-blue-600 dark:text-blue-400 font-semibold select-all">
                soporte@comsertel.com
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setShowSupportModal(false)}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-xl transition-colors shadow-lg shadow-blue-500/10 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
