import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Navbar from "../components/Navbar";
import useRenderContent from "../hooks/useRenderContent";
import Footer from "../components/footer/Footer";
import "../css/footer.css";
import "../css/index.css";
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
    <div className="d-flex flex-column min-vh-100">

      {/* Contenido principal */}
      <div className="d-flex flex-grow-1">

        <div className="nav_contenedor">
          <Navbar
            activeItem={activeItem}
            handleItemClick={setActiveItem}
          />
        </div>

        <div
          id="content"
          className="flex-grow-1 overflow-auto"
        >
          {content}
        </div>

      </div>

      {/* Footer abajo */}
      <Footer />

    </div>

  );
}
