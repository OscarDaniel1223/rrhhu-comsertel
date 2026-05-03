import React, { useState, useMemo, useContext } from "react";
import Badge from "react-bootstrap/Badge";
import DataTable, { createTheme } from "react-data-table-component";
import { ThemeContext } from "../../providers/ThemeContext";


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
        default: '#1f2d40',
    },
    rows: {
        highlightOnHoverStyle: {
            backgroundColor: '#1f2d4055', // color hover
            color: '#FFFFFF',
            transition: '0.2s ease-in-out',
            cursor: 'pointer',
        },
    },
}, 'dark');


const columns = [
    {
        name: "#",
        selector: (row, index) => index + 1,
        sortable: true,
        width: "70px",
    },
    {
        name: "Cliente",
        selector: row => row.cliente,
        sortable: true,
    },
    {
        name: "Fecha",
        selector: row => row.fecha,
        sortable: true,
    },
    {
        name: "Calificación",
        selector: row => row.calificacion,
        sortable: true,
    },
    {
        name: "Comentario",
        selector: row => row.comentario,
        sortable: true,
    },
];


export default function ReviewsTables({ data }) {


    const [filterText, setFilterText] = useState("");



    const filteredItems = useMemo(() => {
        const text = filterText.toLowerCase();

        return data
            ?.filter(item => {
                return (
                    (item.cliente ?? "").toLowerCase().includes(text) ||
                    (item.comentario ?? "").toLowerCase().includes(text) ||
                    (item.calificacion ?? "").toString().toLowerCase().includes(text) ||
                    (item.fecha ?? "").toLowerCase().includes(text)
                );
            }) || [];
    }, [filterText, data]);


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
    return (
        <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            highlightOnHover
            subHeader
            subHeaderComponent={subHeaderComponent}
            persistTableHead
            theme={darkMode ? "customDark" : "default"}
        />
    );
}
