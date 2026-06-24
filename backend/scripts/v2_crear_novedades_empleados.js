const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function migrar() {
    try {
        console.log('Iniciando creacion de la tabla novedades_empleados...');
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS novedades_empleados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_empleado INT NOT NULL,
                mes INT NOT NULL,
                anio INT NOT NULL,
                horas_extras_diurnas DECIMAL(5,2) DEFAULT 0.00,
                horas_extras_nocturnas DECIMAL(5,2) DEFAULT 0.00,
                viaticos DECIMAL(10,2) DEFAULT 0.00,
                beneficios DECIMAL(10,2) DEFAULT 0.00,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_empleado) REFERENCES empleados(id) ON DELETE CASCADE,
                UNIQUE KEY uq_empleado_periodo (id_empleado, mes, anio)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await db.query(createTableQuery);
        console.log('Tabla novedades_empleados creada con exito.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la creacion de la tabla:', error);
        process.exit(1);
    }
}

migrar();
