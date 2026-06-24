import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import useRenderContent from "../hooks/useRenderContent";
import Footer from "../components/footer/Footer";
import { useAuth } from "../providers/AuthContext";

export default function Dashboard() {

  const [activeItem, setActiveItem] = useState("home");
  const isAuthenticated = !!localStorage.getItem('token');
  const cambio_pass = localStorage.getItem('cambio_pass');
  const { user } = useAuth();
  const { content, validItem } = useRenderContent(activeItem, user.rol);

  useEffect(() => {
    if (validItem && validItem !== activeItem) {
      setActiveItem(validItem);
    }
  }, [validItem]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!isAuthenticated || cambio_pass === '0') {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* Boton flotante para abrir la barra lateral en escritorio cuando esta colapsada */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-5 left-5 z-[999] p-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 print:hidden hidden lg:flex items-center justify-center hover:scale-105 cursor-pointer"
          title="Mostrar menu de navegacion"
        >
          <i className="bi bi-chevron-right text-base"></i>
        </button>
      )}

      {/* Contenido principal */}
      <div className="flex flex-1">

        <div className="nav_contenedor">
          <Navbar
            activeItem={activeItem}
            handleItemClick={setActiveItem}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={setIsSidebarOpen}
          />
        </div>

        <div
          id="content"
          className={`flex-1 flex flex-col print:pl-0 overflow-auto transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
          }`}
        >
          <div className="flex-1">
            {content}
          </div>
          {/* Footer dentro del área de contenido para alineación perfecta */}
          <div className="print:hidden">
            <Footer />
          </div>
        </div>

      </div>

    </div>

  );
}
