const db = require('../config/db');


exports.getEnterprise = async (req, res) => {

    try {
        const sql = 'SELECT * FROM empresa';
        const [rows] = await db.query(sql);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron empresas' });
        }
        res.json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al obtener las empresas' });
    }
}
