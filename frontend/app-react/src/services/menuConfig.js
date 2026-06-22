//* DOCUMENTACION DE MENU
// id: id del item para renderizar
// label: nombre del menu
// icon: icono del menu
// rol: roles que pueden ver el menu
// submenu: si es un menu de submenu
// config: si es un menu de configuracion
// empleados: si es un menu de empleados



export const menuItems = [
    { id: "home", label: "Dashboard", icon: "bi-grid", rol: ["1", "3"], submenu: false, config: false },
    { id: "employees", label: "Empleados", icon: "bi-person-vcard", rol: ["1", "3"], submenu: false, config: false },
    { id: "positions", label: "Cargos", icon: "bi-person-badge", rol: ["1", "3"], submenu: false, config: false },
    { id: "absences", label: "Ausencias", icon: "bi-calendar-x", rol: ["1", "3"], submenu: false, config: false },
    { id: "payroll", label: "Planilla", icon: "bi-cash-stack", rol: ["1", "3"], submenu: false, config: false },
    { id: "vacation_programming", label: "Programar Vacaciones", icon: "bi-calendar-check", rol: ["1", "3"], submenu: false, config: false },
    { id: "bono_programming", label: "Programar Aguinaldos", icon: "bi-gift", rol: ["1", "3"], submenu: false, config: false },

    // Configuraciones (se muestran bajo la seccion inferior)
    { id: "users", label: "Lista de usuarios", icon: "bi-people", rol: ["1"], config: true },
];

