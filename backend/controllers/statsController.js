const db = require("../config/db");


exports.getRegisterUsers = async (req, res) => {
    try {
        const users = [];
        const query = "SELECT count(*) as total_usuarios FROM usuarios where estado = 1";
        const [rows] = await db.query(query);
        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron usuarios" });
        }
        for (let i = 0; i < rows.length; i++) {
            users.push({
                title: "Usuarios registrados",
                count: rows[i].total_usuarios,
                icon: "bi bi-people",
                color: "info"
            });
        }
        res.json(users);
    } catch (error) {

        res.status(500).json({ message: "Error al obtener los usuarios" });
    }
}

exports.getDailySales = async (req, res) => {
    try {
        const sales = [];
        const query = "SELECT sum(total) as total_ventas FROM ventas where DATE(fecha_venta) = CURDATE()";
        const [rows] = await db.query(query);
        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron ventas" });
        }
        var total = 0;
        if (rows[0].total_ventas != null) {
            total = Number(rows[0].total_ventas).toFixed(2);
        }

        sales.push({
            title: "Ventas del día",
            count: `$ ${Number(total).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            icon: "bi bi-cash-coin",
            color: "info"
        });

        res.json(sales);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener las ventas" });
    }
}

exports.getRegisterClients = async (req, res) => {
    try {
        const clients = [];
        const query = "SELECT count(*) as total_clientes FROM clientes where estado = 1";
        const [rows] = await db.query(query);
        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron clientes" });
        }
        for (let i = 0; i < rows.length; i++) {
            clients.push({
                title: "Clientes registrados",
                count: rows[i].total_clientes,
                icon: "bi bi-person-raised-hand",
                color: "info"
            });
        }
        res.json(clients);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener los clientes" });
    }
}

//Obtener el total de dinero de este mes de la tabla ventas

exports.getVentasMes = async (req, res) => {
    try {
        const ventas = [];
        const query = "SELECT sum(total) as total_ventas FROM ventas where MONTH(fecha_venta) = MONTH(CURRENT_DATE()) and YEAR(fecha_venta) = YEAR(CURRENT_DATE())";
        const [rows] = await db.query(query);
        let total = 0;
        if (rows[0].total_ventas != null) {
            total = parseFloat(rows[0].total_ventas).toFixed(2);
        }
        for (let i = 0; i < rows.length; i++) {
            ventas.push({
                title: "Ventas del mes",
                count: `$${Number(total).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`,
                icon: "bi bi-currency-dollar",
                color: "info"
            });
        }
        res.json(ventas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener las ventas" });
    }
}


exports.getVentasMesAnterior = async (req, res) => {
    try {
        const ventas = [];
        const query = `SELECT 
        name,
            SUM(CASE 
        WHEN MONTH(fecha_venta) = MONTH(CURRENT_DATE())
        AND YEAR(fecha_venta) = YEAR(CURRENT_DATE())
        THEN total 
        ELSE 0 
    END) AS uv,

            SUM(CASE 
        WHEN MONTH(fecha_venta) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
        AND YEAR(fecha_venta) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
        THEN total 
        ELSE 0 
    END) AS pv

        FROM(
            SELECT 
        total,
            fecha_venta,
            CASE 
            WHEN DAY(fecha_venta) BETWEEN 1 AND 7 THEN 'Semana 1'
            WHEN DAY(fecha_venta) BETWEEN 8 AND 14 THEN 'Semana 2'
            WHEN DAY(fecha_venta) BETWEEN 15 AND 21 THEN 'Semana 3'
            ELSE 'Semana 4'
        END AS name
    FROM ventas
    WHERE estado = 1 and fecha_venta >= DATE_FORMAT(CURRENT_DATE() - INTERVAL 1 MONTH, '%Y-%m-01')
        ) t
GROUP BY name
ORDER BY name; `;

        const [rows] = await db.query(query);
        res.json(rows);



    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener las ventas" });
    }
}