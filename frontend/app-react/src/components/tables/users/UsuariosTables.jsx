import React, { useState, useMemo, useContext } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import DataTable, { createTheme } from "react-data-table-component";
import { ThemeContext } from "../../../providers/ThemeContext";
import { showError, showSuccess, showQuestion, showLoading } from '../../../utils/Alerts';
import Modal_edit from "../../modal/users/Modal_edit";
import { deleteUser } from "../../../services/users/deleteUserServices";
import { activarUserServices } from "../../../services/users/activarUserServices";
import { getUsuarioByIdServices } from "../../../services/users/getUsuarioByIdServices";


createTheme('customDark', {
    text: {
        primary: '#FFFFFF',
        secondary: '#CCCCCC',
    },
    background: {
        default: '#1f2d40',
        text: '#fff',
    },
    context: {
        background: '#1f2d40',
        text: '#FFFFFF',
    },
    divider: {
        default: '#2c3e50',
    },
    rows: {
        highlightOnHoverStyle: {
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#FFFFFF',
            transition: 'background-color 0.2s ease-in-out',
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
            selector: row => (row.estado === 1 ? <Badge bg="success">Activo</Badge> : <Badge bg="danger">Inactivo</Badge>),
            sortable: true,
        },
        {
            name: "Acciones",
            selector: row => (

                (row.estado === 1) ? (
                    <div>
                        <Button onClick={() => handleEdit(row.id_usuario)} variant="warning" size="sm">
                            Editar
                        </Button>
                        <Button onClick={() => handleDelete(row.id_usuario)} variant="danger" size="sm">
                            Eliminar
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Button onClick={() => handleActivate(row.id_usuario)} variant="success" size="sm">
                            Activar
                        </Button>
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
            style={{
                padding: "6px 12px",
                borderRadius: 4,
                border: "1px solid #ccc",
                width: "250px",
            }}
        />
    );
    const { darkMode } = useContext(ThemeContext);
    const customStyles = {
        rows: {
            style: {
                backgroundColor: darkMode ? "#1f2d40" : "#fff",
                color: darkMode ? "#fff" : "#000",
            },
            highlightOnHoverStyle: {
                backgroundColor: darkMode
                    ? "rgba(255,255,255,0.05)"
                    : "#f2f2f2",
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
