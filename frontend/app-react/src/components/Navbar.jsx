import BtnLogout from "./buttons/BtnLogout";
import "../css/navbar.css";
import { useState, useEffect, useContext } from "react";
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
        className="btn  d-lg-none position-fixed"
        style={{
          zIndex: 1051,

          right: '15px',
          top: '15px'
        }}
        onClick={() => setShowMenu(true)}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Sidebar / Offcanvas */}
      <div
        className={`
    offcanvas-lg 
    offcanvas-start 
    fixed-sidebar 
    ${showMenu ? "show" : "d-none"} 
    d-lg-block
  `}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          height: "100vh",

          overflowY: "auto",


          zIndex: 1040,
        }}
        tabIndex="-1"
      >
        <div className="offcanvas-header d-lg-none">
          <h5 style={{ marginLeft: 100 }} className="offcanvas-title">Menú</h5>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={() => setShowMenu(false)}
          ></button>
        </div>

        <div id="nav_contenedor" className="offcanvas-body p-0 d-flex flex-column">
          <div className="shadow-sm" style={{ flex: 1, overflowY: "auto" }}>
            <div className="shadow-sm border-0 rounded-0">
              <div className="d-flex align-items-center justify-content-center">
                <img
                  src={img_logo}
                  alt="Logo de empresa"
                  style={{ width: "100%", height: "120px" }}
                />


              </div>
              <div className="d-flex align-items-center gap-3 p-3 text-left">
                <img
                  src={user_icon}
                  alt="Icono de usuario"
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />

                <p> <small className="mb-0">{user.name}</small></p>
              </div>
              <div className="list-group list-group-flush mt-0">
                {menuItems
                  .filter(item => item.rol.includes(String(user.rol)) && item.config === false && item.submenu === false) // ← filtra por rol
                  .map(item => (
                    <button
                      key={item.id}
                      className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${activeItem === item.id ? "active" : ""
                        }`}
                      onClick={() => {
                        handleItemClick(item.id);
                        setShowMenu(false);
                      }}

                    >
                      <i className={`${item.icon} me-3`}></i>
                      {item.label}
                      {activeItem === item.id && <i className="bi bi-chevron-right ms-auto"></i>}
                    </button>
                  ))}
              </div>
              {/*MENU DE EMPLEADOS PARA RRHH*/}
              {(user.rol == 1 || user.rol == 3) && (

                <div
                  className="card shadow-sm border-0 rounded-0 mt-3"
                  style={{ marginTop: "1rem" }}
                >

                  <div className="accordion" id="toolsAccordion">
                    <div className="accordion-item border-0">

                      <button
                        className={`accordion-button ${user.rol == 3 ? "" : "collapsed"}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseEmpleados"
                        aria-expanded={user.rol == 3 ? "true" : "false"}
                        style={{
                          border: "none",

                        }}
                      >
                        <i className="bi bi-people"></i>
                        &nbsp; Empleados
                      </button>

                      <div
                        id="collapseEmpleados"
                        className={`accordion-collapse collapse ${user.rol == 3 ? "show" : ""}`}
                        data-bs-parent="#toolsAccordion"
                      >
                        <div className="accordion-body p-0">
                          <div className="list-group list-group-flush mt-0">
                            {menuItems
                              .filter(item => item.rol.includes(String(user.rol)) && item.empleados === true) // ← filtra por rol
                              .map(item => (
                                <button
                                  key={item.id}
                                  className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${activeItem === item.id ? "active" : ""
                                    }`}
                                  onClick={() => {
                                    handleItemClick(item.id);
                                    setShowMenu(false);
                                  }}

                                >
                                  <i className={`${item.icon} me-3`}></i>
                                  {item.label}
                                  {activeItem === item.id && <i className="bi bi-chevron-right ms-auto"></i>}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              )}

              {/*MENU DE PLANILLAS PARA RRHH*/}
              {(user.rol == 1 || user.rol == 3) && (

                <div
                  className="card shadow-sm border-0 rounded-0 mt-3"
                  style={{ marginTop: "1rem" }}
                >

                  <div className="accordion" id="toolsAccordion">
                    <div className="accordion-item border-0">

                      <button
                        className={`accordion-button collapsed`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsePlanillas"

                        style={{
                          border: "none",

                        }}
                      >
                        <i className="bi bi-calculator"></i>
                        &nbsp; Planillas
                      </button>

                      <div
                        id="collapsePlanillas"
                        className={`accordion-collapse collapse`}
                        data-bs-parent="#toolsAccordion"
                      >
                        <div className="accordion-body p-0">
                          <div className="list-group list-group-flush mt-0">
                            {menuItems
                              .filter(item => item.rol.includes(String(user.rol)) && item.planillas === true) // ← filtra por rol
                              .map(item => (
                                <button
                                  key={item.id}
                                  className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${activeItem === item.id ? "active" : ""
                                    }`}
                                  onClick={() => {
                                    handleItemClick(item.id);
                                    setShowMenu(false);
                                  }}

                                >
                                  <i className={`${item.icon} me-3`}></i>
                                  {item.label}
                                  {activeItem === item.id && <i className="bi bi-chevron-right ms-auto"></i>}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              )}



              {/*MENU DE CONFIGURACION GENERAL PARA TODOS EL FILTRADO POR ROL SE HACE ABAJO*/}

              <div
                className="card shadow-sm border-0 rounded-0 mt-3"
                style={{ marginTop: "1rem" }}
              >

                <div className="accordion" id="toolsAccordion">
                  <div className="accordion-item border-0">

                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseConfig"

                      style={{
                        border: "none",

                      }}
                    >
                      <i className="bi bi-gear"></i>
                      &nbsp; Configuraciones
                    </button>

                    <div
                      id="collapseConfig"
                      className="accordion-collapse collapse"
                      data-bs-parent="#toolsAccordion"
                    >
                      <div className="accordion-body p-0">
                        <div className="list-group list-group-flush mt-0">
                          {menuItems
                            .filter(item => item.rol.includes(String(user.rol)) && item.config === true) // ← filtra por rol
                            .map(item => (
                              <button
                                key={item.id}
                                className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${activeItem === item.id ? "active" : ""
                                  }`}
                                onClick={() => {
                                  handleItemClick(item.id);
                                  setShowMenu(false);
                                }}

                              >
                                <i className={`${item.icon} me-3`}></i>
                                {item.label}
                                {activeItem === item.id && <i className="bi bi-chevron-right ms-auto"></i>}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>






            </div>

            <div
              className="mt-5"
            >
              <BtnLogout />
            </div>
            <div className="mt-2">
              <button className="btn btn-outline-primary w-100" onClick={() => setDarkMode(!darkMode)}>
                <i className={`bi ${darkMode ? 'bi-moon' : 'bi-sun'}`}></i>
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
