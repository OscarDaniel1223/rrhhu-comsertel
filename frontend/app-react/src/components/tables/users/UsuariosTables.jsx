import React, { useState, useMemo, useContext } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import { ThemeContext } from "../../../providers/ThemeContext";
import { showError, showSuccess, showQuestion, showLoading } from '../../../utils/alerts';
import Modal_edit from "../../modal/users/Modal_edit";
import { deleteUser } from "../../../services/users/deleteUserServices";
import { activarUserServices } from "../../../services/users/activarUserServices";
import { getUsuarioByIdServices } from "../../../services/users/getUsuarioByIdServices";


createTheme('customDark', {
    text: {
        primary: '#f8fafc',
        secondary: '#94a3b8',
    },
    background: {
        default: '#0f172a',
        text: '#f8fafc',
    },
    context: {
        background: '#0f172a',
        text: '#f8fafc',
    },
    divider: {
        default: '#334155',
    },
    rows: {
        highlightOnHoverStyle: {
            backgroundColor: '#1e293b', // color hover
            color: '#f8fafc',
            transition: '0.2s ease-in-out',
            cursor: 'pointer',
        },
    },
}, 'dark');













export default function UsuariosTables({ data, refreshUsers }) {

    const [showModal, setShowModal] = useState(false);
    const [data_edit, setData_edit] = useState({});




    const columns = [
        {
            name: "#",
            selector: (row, index) => index + 1,
            sortable: true,
            width: "70px",
        },
        {
            name: "Nombre",
            selector: row => row.nombre,
            sortable: true,
        },
        {
            name: "Email",
            selector: row => row.email,
            sortable: true,
        },
        {
            name: "Rol",
            selector: row => row.rol,
            sortable: true,
        },
        {
            name: "Estado",
            selector: row => (
                row.estado === 1 ? (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        Activo
                    </span>
                ) : (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Inactivo
                    </span>
                )
            ),
            sortable: true,
        },
        {
            name: "Acciones",
            selector: row => (

                (row.estado === 1) ? (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleEdit(row.id_usuario)} 
                            className="px-2.5 py-1 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 dark:text-amber-300 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 rounded transition-colors duration-200"
                        >
                            Editar
                        </button>
                        <button 
                            onClick={() => handleDelete(row.id_usuario)} 
                            className="px-2.5 py-1 text-xs font-medium text-red-800 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded transition-colors duration-200"
                        >
                            Eliminar
                        </button>
                    </div>
                ) : (
                    <div>
                        <button 
                            onClick={() => handleActivate(row.id_usuario)} 
                            className="px-2.5 py-1 text-xs font-medium text-green-800 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded transition-colors duration-200"
                        >
                            Activar
                        </button>
                    </div>
                )
            ),
            sortable: true,
        }
    ];


    const handleEdit = async (id_usuario) => {

        try {

            const response = await getUsuarioByIdServices(id_usuario);
            if (response.status === 200) {
                setData_edit(response.data);
                setShowModal(true);
            } else {
                showError(response.message, "error");
            }


        } catch (error) {
            showError("Error de comunicación con el servidor, contacte a soporte técnico", "error");
        }
    }

    const handleDelete = async (id_usuario) => {

        const result = await showQuestion("¿Estas seguro de eliminar el usuario?", "Eliminar usuario");

        if (!result.isConfirmed) {
            return;
        }



        try {
            showLoading(true, "Eliminando usuario...");
            const response = await deleteUser(id_usuario);
            showLoading(false);
            if (response.status === 200) {
                await showSuccess(response.message, "success");
                refreshUsers();
            } else {
                await showError(response.message, "error");
            }

        } catch (error) {
            showLoading(false);
            await showError("Error de comunicación con el servidor, contacte a soporte técnico", "error");
        }
    }
    const handleActivate = async (id_usuario) => {

        const result = await showQuestion("¿Estas seguro de activar el usuario?", "Activar usuario");

        if (!result.isConfirmed) {
            return;
        }



        try {
            showLoading(true, "Activando usuario...");
            const response = await activarUserServices(id_usuario);
            showLoading(false);
            if (response.status === 200) {
                await showSuccess(response.message, "success");
                refreshUsers();
            } else {
                await showError(response.message, "error");
            }

        } catch (error) {
            showLoading(false);
            await showError("Error de comunicación con el servidor, contacte a soporte técnico", "error");
        }
    }



    const [filterText, setFilterText] = useState("");



    const filteredItems = useMemo(() => {
        const text = filterText.toLowerCase();

        return data
            ?.filter(item => {
                return (
                    (item.nombre ?? "").toLowerCase().includes(text)

                );
            }) || [];
    }, [filterText, data, refreshUsers]);


    const subHeaderComponent = (
        <input
            type="text"
            placeholder="Buscar..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="px-3 py-1.5 w-[250px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
        />
    );
    const { darkMode } = useContext(ThemeContext);
    const customStyles = {
        rows: {
            style: {
                backgroundColor: darkMode ? "#0f172a" : "#fff",
                color: darkMode ? "#f8fafc" : "#0f172a",
            },
            highlightOnHoverStyle: {
                backgroundColor: darkMode
                    ? "#1e293b"
                    : "#f1f5f9",
                cursor: "pointer",
                transition: "background-color 0.2s ease-in-out",
            },
        },
    };

    return (
        <>
            <Modal_edit show={showModal} onHide={() => setShowModal(false)} title="Editar Usuario" data={data_edit} refreshUsers={refreshUsers} />


            <DataTable
                columns={columns}
                data={filteredItems}
                pagination
                highlightOnHover
                subHeader
                subHeaderComponent={subHeaderComponent}
                persistTableHead
                customStyles={customStyles}
                theme={darkMode ? "customDark" : "default"}
            />
        </>
    );
}
