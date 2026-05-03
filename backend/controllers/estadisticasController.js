const db = require("../config/db");
function ultimosMeses(n = 3) {
    const meses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hoy = new Date();

    let resultado = [];

    for (let i = n - 1; i >= 0; i--) {
        let fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        resultado.push({
            monthNumber: fecha.getMonth() + 1,  // 1–12
            year: fecha.getFullYear(),
            name: meses[fecha.getMonth()]       // "Sep", "Oct", "Nov"
        });
    }

    return resultado;
}


exports.getSellsLastThreeMonths = async (req, res) => {
    try {
        const meses = ultimosMeses(3);
        const resultado = [];

        for (const mes of meses) {
            const [rows] = await db.query(
                `
                SELECT COUNT(*) AS total 
                FROM ventas 
                WHERE MONTH(fecha_venta) = ? 
                AND YEAR(fecha_venta) = ?
                `,
                [mes.monthNumber, mes.year]
            );

            resultado.push({
                name: mes.name,
                value: rows[0].total
            });
        }

        res.json(resultado);

    } catch (error) {

        res.status(500).json({ message: "Error al obtener las ventas" });
    }
};


exports.CategoriesMostSold = async (req, res) => {
    try {
        //Top 5 ventas este mes
        const mesActual = new Date().getMonth() + 1;
        const [rows] = await db.query(
            `
            SELECT   c.descripcion AS name, COUNT(*) AS value
            FROM articulos a
            JOIN ventas_detalle v ON a.id_articulo = v.id_articulo
            JOIN categoria c ON a.id_categoria = c.id_categoria
            WHERE MONTH(created_at) = ? 
            GROUP BY c.descripcion
            ORDER BY value DESC
            LIMIT 5
            `,
            [mesActual]
        );

        res.json(rows);
    } catch (error) {

        res.status(500).json({ message: "Error al obtener los productos más vendidos" });
    }
};