const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function migrar() {
    try {
        console.log('Iniciando migracion de la base de datos...');
        
        // Verificar columnas existentes en boletas_pago
        const [columnas] = await db.query('DESCRIBE boletas_pago');
        const nombresColumnas = columnas.map(col => col.Field);
        
        if (!nombresColumnas.includes('viaticos')) {
            console.log('Agregando columna viaticos a boletas_pago...');
            await db.query('ALTER TABLE boletas_pago ADD COLUMN viaticos DECIMAL(10,2) DEFAULT 0.00 AFTER aguinaldo');
        } else {
            console.log('La columna viaticos ya existe.');
        }

        if (!nombresColumnas.includes('horas_extras_diurnas')) {
            console.log('Agregando columna horas_extras_diurnas a boletas_pago...');
            await db.query('ALTER TABLE boletas_pago ADD COLUMN horas_extras_diurnas DECIMAL(10,2) DEFAULT 0.00 AFTER viaticos');
        } else {
            console.log('La columna horas_extras_diurnas ya existe.');
        }

        if (!nombresColumnas.includes('horas_extras_nocturnas')) {
            console.log('Agregando columna horas_extras_nocturnas a boletas_pago...');
            await db.query('ALTER TABLE boletas_pago ADD COLUMN horas_extras_nocturnas DECIMAL(10,2) DEFAULT 0.00 AFTER horas_extras_diurnas');
        } else {
            console.log('La columna horas_extras_nocturnas ya existe.');
        }

        console.log('Migracion completada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error durante la migracion:', error);
        process.exit(1);
    }
}

migrar();
