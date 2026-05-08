import React, { useState } from "react";
import Select from "react-select";
import Header from "../header/Header";
import useRoles from "../../hooks/users/useRoles";
import { getRoles } from "../../services/users/rolesServices";
import UsersCard from "../cards/usuarios/UsersCard";
import Roles_select from "../selects/Roles_select";
import Modal_default from '../modal/Modal_default';
import { showError, showSuccess } from '../../utils/alerts';
import useNewUser from '../../hooks/users/useNewUser';
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

  //Agregar todos a options
  options.unshift({ value: null, label: "Todos" });


  //definir los useState para el cambio de estado y rol de los selectores
  const [rol, setRol] = useState(options[0])
  const [estado, setEstado] = useState(estadoOptions[0])
  const [rolModal, setRolModal] = useState(null)

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

    //validar el formato del email
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
        //llamr nuevamente a la funcion para actualizar la lista
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
      <div className="contenedor row rounded-xl ">
        <div className="col-sm-12 col-md-6 col-lg-4">
          <label htmlFor="">Rol</label>
          <Select className="select_custom" classNamePrefix="select"
            options={options}
            value={rol}
            onChange={(selected) => setRol(selected)}

          />
        </div>

        <div className="col-sm-12 col-md-6 col-lg-4">
          <label htmlFor="">Estado</label>
          <Select className="select_custom" classNamePrefix="select"
            options={estadoOptions}
            value={estado}
            onChange={(selected) => setEstado(selected)}


          />

        </div>

        <div className="col-sm-12 col-md-4 col-lg-2 mt-4">

          <button onClick={() => setShowModal(true)} style={{ minHeight: "38px", width: "100%" }} className="btn btn-success"><i className="bi bi-person-plus-fill"></i> Agregar</button>
        </div>
        <div className="col-sm-12 mt-5">
          <UsersCard rol={rol.value} estado={estado.value} refreshUsers={reloadUsers} refreshTrigger={refreshUsers} />
        </div>
      </div>



      <Modal_default className="modal_custom" show={showModal} onHide={() => setShowModal(false)} title="Agregar Usuario">
        <form id="form_new_user" onSubmit={sendForm}>
          <div className="mb-3">
            <h3>Informacion personal</h3>
            <label htmlFor="nombres" className="form-label">Nombres</label>
            <input type="text" name="nombres" placeholder="Nombres" className="form-control custom_input required" id="nombres" />
            <div className="form-text"></div>
          </div>
          <div className="mb-3">
            <label htmlFor="apellidos" className="form-label">Apellidos</label>
            <input type="text" name="apellidos" placeholder="Apellidos" className="form-control custom_input required" id="apellidos" />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Correo</label>
            <input type="email" name="email" placeholder="Correo" className="form-control custom_input required" id="email" />
          </div>

          <div className="mb-3">
            <label htmlFor="numero_documento" className="form-label">N° Documento</label>
            <input type="text" name="numero_documento" placeholder="N° Documento" className="form-control custom_input required" id="numero_documento" />
          </div>
          <div className="mb-3">
            <label htmlFor="telefono" className="form-label">Telefono</label>
            <input type="text" name="telefono" placeholder="Telefono" className="form-control custom_input required" id="telefono" />
          </div>


          <h3>Accesos al sistema</h3>

          <div className="mb-3">
            <label htmlFor="rol" className="form-label">Rol</label>
            <Roles_select
              id="rol"
              name="idrol"
              options={option_modal}
              value={rolModal}
              onChange={(selected) => handleRolChangeModal(selected)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña temporal</label>
            <input type="text" name="password" placeholder="Contraseña temporal" className="form-control custom_input required" id="password" />
          </div>
          <button type="submit" id="btn_submit" className="btn btn-primary">Guardar</button>
        </form>
      </Modal_default>
    </>

  );
}
