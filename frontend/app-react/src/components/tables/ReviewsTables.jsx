import React, { useState, useMemo, useContext } from "react";
import DataTable, { createTheme } from "react-data-table-component";
import { ThemeContext } from "../../providers/ThemeContext";


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
            className="px-3 py-1.5 w-[250px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
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
