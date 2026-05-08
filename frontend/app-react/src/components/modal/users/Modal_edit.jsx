import { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import useRoles from "../../../hooks/users/useRoles";
import { getRoles } from "../../../services/users/rolesServices";
import Roles_select from "../../selects/Roles_select";
import { updateUserServices } from "../../../services/users/updateUserServices";
import { showError, showSuccess, showLoading, showQuestion } from '../../../utils/alerts';

export default function Modal_edit({ show, onHide, title, data, refreshUsers }) {


    const [rol, setRol] = useState(null);
    const [form, setForm] = useState({
        id_usuario: "",
        nombre: "",
        numero_documento: "",
        email: "",
        telefono: ""

    });
    useEffect(() => {
        if (data) {
            setRol({
                value: data.idrol,
                label: data.rol_nombre
            });
        }
    }, [data]);

    useEffect(() => {
        if (data) {
            setForm(prev => ({
                ...prev,
                ...data
            }));
        }
    }, [data]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const roles = useRoles(getRoles);

    const options = roles.map((role) => ({
        value: role.id_rol,
        label: role.rol,
    }));

    options.unshift({ value: null, label: "Seleccione un rol..." });

    const sendForm = async (e) => {
        e.preventDefault();

        var id_rol = rol.value;

        var nombre = document.getElementById("nombre_edit").value.trim();
        var email = document.getElementById("email_edit").value.trim();
        var telefono = document.getElementById("telefono_edit").value.trim().toString();
        var numero_documento = document.getElementById("numero_documento_edit").value.trim().toString();


        if (nombre === "" || nombre === null) {
            showError("Ingrese nombre completo", "warning");
            document.getElementById("nombres_edit").focus();
            return;
        }

        if (nombre.length < 5) {
            showError("Nombre ingresado muy corto, ingrese el nombre completo", "warning");
            document.getElementById("nombres_edit").focus();
            return;
        }

        if (email === "" || email === null) {
            showError("Ingrese un correo", "warning");
            document.getElementById("email_edit").focus();
            return;
        }
        if (email.length < 3) {
            showError("Correo debe tener al menos 3 caracteres", "warning");
            document.getElementById("email_edit").focus();
            return;
        }

        //validar el formato del email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError("Correo debe tener un formato valido", "warning");
            document.getElementById("email_edit").focus();
            return;
        }

        if (numero_documento === "" || numero_documento === null) {
            showError("Ingrese un numero de documento", "warning");
            document.getElementById("numero_documento_edit").focus();
            return;
        }
        if (numero_documento.length < 9) {
            showError("Numero de documento debe tener al menos 9 caracteres", "warning");
            document.getElementById("numero_documento_edit").focus();
            return;
        }
        if (telefono === "" || telefono === null) {
            showError("Ingrese un telefono", "warning");
            document.getElementById("telefono_edit").focus();
            return;
        }
        if (telefono.length < 8) {
            showError("Telefono debe tener al menos 8 caracteres", "warning");
            document.getElementById("telefono_edit").focus();
            return;
        }
        if (id_rol === "" || id_rol === null) {
            showError("Seleccione un rol", "warning");
            document.getElementById("rol_edit").focus();
            return;
        }

        const formData = new FormData(e.target);
        const dataSend = Object.fromEntries(formData);

        dataSend.idrol = id_rol;

        const result = await showQuestion("¿Estas seguro de actualizar el usuario?", "Actualizar usuario");

        if (!result.isConfirmed) {
            return;

        }

        try {

            showLoading(true, "Actualizando usuario...");

            const response = await updateUserServices(dataSend);

            showLoading(false);

            if (response.status === 200) {

                await showSuccess(response.message, "success");

                refreshUsers();
                onHide();

            } else {
                showError(response.message, "error");
            }

        } catch (error) {

            showLoading(false);

            showError("Error de comunicación con el servidor, contacte a soporte técnico", "error");
        }
    }




    return (


        <Modal dialogClassName="modal-top" size="lg" backdrop="static" keyboard={false} show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <form id="form_edit_user" onSubmit={sendForm}>
                    <div className="mb-3">
                        <h3>Informacion personal</h3>
                        <input onChange={handleChange} type="hidden" name="id_usuario" id="id_usuario" value={form.id_usuario} />
                        <label htmlFor="nombres" className="form-label">Nombre completo</label>
                        <input onChange={handleChange} type="text" name="nombre" value={form.nombre} placeholder="Nombre completo" className="form-control custom_input required" id="nombre_edit" />
                        <div className="form-text"></div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Correo</label>
                        <input onChange={handleChange} type="email" name="email" value={form.email} placeholder="Correo" className="form-control custom_input required" id="email_edit" />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="numero_documento" className="form-label">N° Documento</label>
                        <input onChange={handleChange} type="text" name="numero_documento" value={form.numero_documento} placeholder="N° Documento" className="form-control custom_input required" id="numero_documento_edit" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="telefono" className="form-label">Telefono</label>
                        <input onChange={handleChange} type="text" name="telefono" value={form.telefono} placeholder="Telefono" className="form-control custom_input required" id="telefono_edit" />
                    </div>


                    <div className="mb-3">
                        <label htmlFor="rol" className="form-label">Rol</label>
                        <Roles_select options={options} value={rol} onChange={(selected) => setRol(selected)} />

                    </div>

                    <button type="submit" className="btn btn-success">Actualizar</button>
                </form>
            </Modal.Body>
        </Modal>

    );
}