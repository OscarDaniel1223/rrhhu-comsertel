const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function migrar() {
    try {
        console.log('Iniciando migracion para novedades diarias...');
        
        // 1. Eliminar la tabla vieja si existe
        await db.query('DROP TABLE IF EXISTS novedades_empleados');
        console.log('Tabla anterior eliminada (si existia).');

        // 2. Crear la nueva tabla de novedades_empleados basada en fecha (registro diario)
        const createTableQuery = `
            CREATE TABLE novedades_empleados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_empleado INT NOT NULL,
                fecha DATE NOT NULL,
                horas_extras_diurnas DECIMAL(5,2) DEFAULT 0.00,
                horas_extras_nocturnas DECIMAL(5,2) DEFAULT 0.00,
                viaticos DECIMAL(10,2) DEFAULT 0.00,
                beneficios DECIMAL(10,2) DEFAULT 0.00,
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (id_empleado) REFERENCES empleados(id) ON DELETE CASCADE,
                UNIQUE KEY uq_empleado_fecha (id_empleado, fecha)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await db.query(createTableQuery);
        console.log('Tabla novedades_empleados (diaria) creada con exito.');
        
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migracion de novedades diarias:', error);
        process.exit(1);
    }
}

migrar();
