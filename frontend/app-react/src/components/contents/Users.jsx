import React, { useState } from "react";
import Select from "react-select";
import Header from "../header/Header";
import useRoles from "../../hooks/users/useRoles";
import { getRoles } from "../../services/users/rolesServices";
import UsersCard from "../cards/usuarios/UsersCard";
import Roles_select from "../selects/Roles_select";
import Modal_default from '../modal/Modal_default';
import { showError, showSuccess } from '../../utils/alerts';
import { newUserServices } from '../../services/users/newUserServices';

export default function Users() {
  const [newUser, setNewUser] = useState([]);
  const [refreshUsers, setRefreshUsers] = useState(false);
  const reloadUsers = () => {
    setRefreshUsers(prev => !prev);
  };
  const roles = useRoles(getRoles);

  const options = roles.map((role) => ({
    value: role.id_rol,
    label: role.rol,
  }));

  const option_modal = roles.map((role) => ({
    value: role.id_rol,
    label: role.rol,
  }));

  const estadoOptions = [
    { value: 1, label: "Activo" },
    { value: 0, label: "Inactivo" },
    { value: null, label: "Todos" },
  ];

  options.unshift({ value: null, label: "Todos" });

  const [rol, setRol] = useState(options[0]);
  const [estado, setEstado] = useState(estadoOptions[0]);
  const [rolModal, setRolModal] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRolChange = (selected) => {
    setRol(selected);
    setEstado(estadoOptions[0]);
  };

  const handleEstadoChange = (selected) => {
    setEstado(selected);
    setRol(rol.value);
  };

  const handleRolChangeModal = (selected) => {
    setRolModal(selected);
  };

  const sendForm = async (e) => {
    e.preventDefault();
    document.getElementById("btn_submit").disabled = true;

    var nombres = document.getElementById("nombres").value.trim();
    var apellidos = document.getElementById("apellidos").value.trim();
    var email = document.getElementById("email").value.trim();
    var telefono = document.getElementById("telefono").value.trim().toString();
    var numero_documento = document.getElementById("numero_documento").value.trim().toString();
    var password = document.getElementById("password").value.trim();

    if (nombres === "" || nombres === null) {
      showError("Ingrese nombres", "warning");
      document.getElementById("nombres").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }

    if (nombres.length < 3) {
      showError("Nombres debe tener al menos 3 caracteres", "warning");
      document.getElementById("nombres").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }
    if (apellidos === "" || apellidos === null) {
      showError("Ingrese apellidos", "warning");
      document.getElementById("apellidos").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }
    if (apellidos.length < 3) {
      showError("Apellidos debe tener al menos 3 caracteres", "warning");
      document.getElementById("apellidos").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }
    if (email === "" || email === null) {
      showError("Ingrese un correo", "warning");
      document.getElementById("email").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }
    if (email.length < 3) {
      showError("Correo debe tener al menos 3 caracteres", "warning");
      document.getElementById("email").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Correo debe tener un formato valido", "warning");
      document.getElementById("email").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }

    if (numero_documento === "" || numero_documento === null) {
      showError("Ingrese un numero de documento", "warning");
      document.getElementById("numero_documento").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }
    if (numero_documento.length < 9) {
      showError("Numero de documento debe tener al menos 9 caracteres", "warning");
      document.getElementById("numero_documento").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }
    if (telefono === "" || telefono === null) {
      showError("Ingrese un telefono", "warning");
      document.getElementById("telefono").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }
    if (telefono.length < 8) {
      showError("Telefono debe tener al menos 8 caracteres", "warning");
      document.getElementById("telefono").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }
    if (rolModal === null) {
      showError("Seleccione un rol", "warning");
      document.getElementById("rol_modal").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }
    var id_rol = rolModal.value;

    if (password === "" || password === null) {
      showError("Ingrese una contraseña", "warning");
      document.getElementById("password").focus();
      document.getElementById("btn_submit").disabled = false;
      return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    data.idrol = id_rol;

    try {
      const response = await newUserServices(data);

      if (response.status === 200) {
        showSuccess(response.message, "success");
        reloadUsers();
        setRolModal(null);
        setShowModal(false);
      }
      else {
        showError(response.message, "error");
      }
      document.getElementById("btn_submit").disabled = false;

    } catch (error) {
      showError("Error al crear el usuario", "error");
      document.getElementById("btn_submit").disabled = false;
    }
  }

  return (
    <>
      <Header title="Gestion de Usuarios" subtitle="Aqui puedes gestionar los usuarios de tu sistema." />
      
      <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mt-4 flex flex-col md:flex-row gap-4 items-end transition-colors duration-200">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rol</label>
          <Select 
            className="select_custom" 
            classNamePrefix="select"
            options={options}
            value={rol}
            onChange={(selected) => setRol(selected)}
          />
        </div>

        <div className="w-full md:w-1/3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Estado</label>
          <Select 
            className="select_custom" 
            classNamePrefix="select"
            options={estadoOptions}
            value={estado}
            onChange={(selected) => setEstado(selected)}
          />
        </div>

        <div className="w-full md:w-auto">
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 w-full md:w-auto min-h-[38px]"
          >
            <i className="bi bi-person-plus-fill"></i>
            Agregar
          </button>
        </div>
      </div>

      <div className="mt-6">
        <UsersCard rol={rol.value} estado={estado.value} refreshUsers={reloadUsers} refreshTrigger={refreshUsers} />
      </div>

      <Modal_default className="modal_custom" show={showModal} onHide={() => setShowModal(false)} title="Agregar Usuario">
        <form id="form_new_user" onSubmit={sendForm} className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Información personal</h3>
            
            <label htmlFor="nombres" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nombres</label>
            <input 
              type="text" 
              name="nombres" 
              placeholder="Nombres" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
              id="nombres" 
            />
          </div>
          
          <div>
            <label htmlFor="apellidos" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Apellidos</label>
            <input 
              type="text" 
              name="apellidos" 
              placeholder="Apellidos" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
              id="apellidos" 
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Correo</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Correo" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
              id="email" 
            />
          </div>

          <div>
            <label htmlFor="numero_documento" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">N° Documento</label>
            <input 
              type="text" 
              name="numero_documento" 
              placeholder="N° Documento" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
              id="numero_documento" 
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Teléfono</label>
            <input 
              type="text" 
              name="telefono" 
              placeholder="Teléfono" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
              id="telefono" 
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider my-4">Accesos al sistema</h3>
            
            <label htmlFor="rol_modal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rol</label>
            <div id="rol_modal" tabIndex="-1">
              <Roles_select
                options={option_modal}
                value={rolModal}
                onChange={(selected) => handleRolChangeModal(selected)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Contraseña temporal</label>
            <input 
              type="text" 
              name="password" 
              placeholder="Contraseña temporal" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
              id="password" 
            />
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
            <button 
              type="submit" 
              id="btn_submit" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Guardar
            </button>
          </div>
        </form>
      </Modal_default>
    </>
  );
}
