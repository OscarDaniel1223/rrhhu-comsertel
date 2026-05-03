const db = require("../config/db");

exports.getReviews = async (req, res) => {

    try {

        const reviewsArray = [];

        //Obtener las reiews del mes actual 
        const [rows] = await db.query(
            `
            SELECT r.*, CONCAT(c.nombres, ' ', c.apellidos) AS nombre_cliente  
            FROM reviews r JOIN clientes c ON r.id_cliente = c.id_cliente 
            WHERE r.estado = 1 AND MONTH(r.fecha) = MONTH(CURRENT_DATE()) AND YEAR(r.fecha) = YEAR(CURRENT_DATE())
            `);
        if (rows.length === 0) {
            return res.status(200).json({});
        }

        for (let i = 0; i < rows.length; i++) {
            reviewsArray.push({
                cliente: rows[i].nombre_cliente,
                fecha: new Date(rows[i].fecha).toLocaleDateString("es-ES"),
                calificacion: rows[i].calificacion,
                comentario: rows[i].comentario,
            });
        }

        res.json(reviewsArray);
    } catch (error) {

        res.status(500).json({ message: "Error al obtener las reviews" });
    }
}