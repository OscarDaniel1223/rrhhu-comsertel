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

  if (!isAuthenticated || cambio_pass === '0') {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* Contenido principal */}
      <div className="flex flex-1">

        <div className="nav_contenedor">
          <Navbar
            activeItem={activeItem}
            handleItemClick={setActiveItem}
          />
        </div>

        <div
          id="content"
          className="flex-1 flex flex-col lg:pl-64 print:pl-0 overflow-auto"
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
