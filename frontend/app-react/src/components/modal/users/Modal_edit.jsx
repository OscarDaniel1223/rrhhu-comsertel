import { useState, useEffect } from "react";
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
            document.getElementById("nombre_edit").focus();
            return;
        }

        if (nombre.length < 5) {
            showError("Nombre ingresado muy corto, ingrese el nombre completo", "warning");
            document.getElementById("nombre_edit").focus();
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

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop oscuro */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
                onClick={onHide}
            ></div>
            
            {/* Contenedor del Modal */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 transition-all transform scale-100 duration-200 z-10 overflow-hidden">
                {/* Cabecera */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>
                    <button 
                        onClick={onHide} 
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    >
                        <i className="bi bi-x-lg text-lg"></i>
                    </button>
                </div>
                
                {/* Cuerpo */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <form id="form_edit_user" onSubmit={sendForm} className="space-y-4">
                        <input onChange={handleChange} type="hidden" name="id_usuario" id="id_usuario" value={form.id_usuario} />
                        
                        <div>
                            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                                Información personal
                            </h4>
                            <label htmlFor="nombre_edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nombre completo
                            </label>
                            <input 
                                onChange={handleChange} 
                                type="text" 
                                name="nombre" 
                                value={form.nombre} 
                                placeholder="Nombre completo" 
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
                                id="nombre_edit" 
                            />
                        </div>

                        <div>
                            <label htmlFor="email_edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Correo
                            </label>
                            <input 
                                onChange={handleChange} 
                                type="email" 
                                name="email" 
                                value={form.email} 
                                placeholder="Correo" 
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
                                id="email_edit" 
                            />
                        </div>

                        <div>
                            <label htmlFor="numero_documento_edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                N° Documento
                            </label>
                            <input 
                                onChange={handleChange} 
                                type="text" 
                                name="numero_documento" 
                                value={form.numero_documento} 
                                placeholder="N° Documento" 
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
                                id="numero_documento_edit" 
                            />
                        </div>

                        <div>
                            <label htmlFor="telefono_edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Teléfono
                            </label>
                            <input 
                                onChange={handleChange} 
                                type="text" 
                                name="telefono" 
                                value={form.telefono} 
                                placeholder="Teléfono" 
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors" 
                                id="telefono_edit" 
                            />
                        </div>

                        <div>
                            <label htmlFor="rol_edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Rol
                            </label>
                            <div id="rol_edit" tabIndex="-1">
                                <Roles_select options={options} value={rol} onChange={(selected) => setRol(selected)} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
                            <button 
                                type="submit" 
                                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            >
                                Actualizar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}