//* DOCUMENTACION DE MENU
// id: id del item para renderizar
// label: nombre del menu
// icon: icono del menu
// rol: roles que pueden ver el menu
// submenu: si es un menu de submenu
// config: si es un menu de configuracion
// empleados: si es un menu de empleados



export const menuItems = [
    { id: "home", label: "Dashboard", icon: "bi bi-speedometer", rol: ["1"], submenu: false, config: false },
    { id: "users", label: "Lista de usuarios", icon: "bi-people", rol: ["1"], submenu: false, config: true },
    { id: "products", label: "Productos", icon: "bi-box", rol: ["1", "2"], submenu: false, config: false },
    { id: "sales", label: "Ventas", icon: "bi-cart", rol: ["1", "2"], submenu: false, config: false },
    { id: "reports", label: "Reportes", icon: "bi-graph-up", rol: ["1"], submenu: false, config: false },

    // menu de empleados
    { id: "employees", label: "Empleados", icon: "", rol: ["1", "3"], submenu: true, config: false, empleados: true },
    { id: "absences", label: "Ausencias", icon: "", rol: ["1", "3"], submenu: true, config: false, empleados: true },

    // menu de planillas
    { id: "payroll", label: "Generar planilla", icon: "", rol: ["1", "3"], submenu: true, config: false, planillas: true },
    { id: "payroll_reports", label: "Reportes", icon: "", rol: ["1", "3"], submenu: true, config: false, planillas: true },

    //Menu configuracion
    { id: "absence_types", label: "Tipos de ausencias", icon: "bi-calendar-x", rol: ["1", "3"], config: true },
];

