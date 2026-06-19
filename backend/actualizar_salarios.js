require('dotenv').config();
const db = require('./config/db');

async function main() {
    const args = process.argv.slice(2);
    
    try {
        if (args.length === 0) {
            // Caso sin argumentos: Listar cargos y mostrar ayuda
            const [cargos] = await db.query('SELECT c.id, c.titulo, c.salario_base, d.nombre AS departamento FROM cargos c JOIN departamentos d ON c.id_departamento = d.id ORDER BY c.id');
            console.log('--- LISTADO DE CARGOS ACTUALES ---');
            cargos.forEach(cargo => {
                console.log(`ID: ${cargo.id.toString().padEnd(4)} | Cargo: ${cargo.titulo.padEnd(30)} | Salario Base: $${parseFloat(cargo.salario_base).toFixed(2).padStart(8)} | Area: ${cargo.departamento}`);
            });
            console.log('\nUso del script:');
            console.log('  node actualizar_salarios.js <salario_fijo>       - Establece el mismo salario base para todos los cargos (ej. node actualizar_salarios.js 500)');
            console.log('  node actualizar_salarios.js distribuir           - Aplica salarios distribuidos para pruebas de distintos tramos (ISSS, AFP, Renta, Quincena 25)');
            console.log('  node actualizar_salarios.js restaurar            - Restaura los salarios a sus valores por defecto de produccion/desarrollo');
            process.exit(0);
        }

        const comando = args[0];

        if (comando === 'distribuir') {
            // Aplicar salarios distribuidos sistematicamente para pruebas
            // Distribucion ideal para abarcar todos los tramos de Renta, ISSS, AFP y Quincena Veinticinco:
            // - Menores a $365 (salario minimo rural/antiguo o parcial)
            // - $365 (salario minimo comercio/servicios)
            // - $500 (Tramo I Renta Mensual - Sin Renta)
            // - $750 (Tramo II Renta Mensual - Renta 10% y Quincena 25)
            // - $1200 (Tramo III Renta Mensual - Renta 20% y Quincena 25)
            // - $1450 (Tramo III Renta Mensual - Quincena 25 limite maximo)
            // - $1600 (Tramo III Renta Mensual - Excede Quincena 25)
            // - $2100 (Tramo IV Renta Mensual - Renta 30%)
            // - $7500 (Excede el techo del AFP de $7,028.29)
            const salariosPrueba = [
                365.00,  // Cargo 1
                450.00,  // Cargo 2
                800.00,  // Cargo 3
                365.00,  // Cargo 4
                550.00,  // Cargo 5
                900.00,  // Cargo 6
                1200.00, // Cargo 7
                1450.00, // Cargo 8
                1600.00, // Cargo 9
                2100.00, // Cargo 10
                7200.00, // Cargo 11 (para probar techo de AFP)
                380.00,  // Cargo 12
                480.00,  // Cargo 13
                600.00,  // Cargo 14
                950.00,  // Cargo 15
                1100.00, // Cargo 16
                1350.00, // Cargo 17
                1750.00, // Cargo 18
                2500.00  // Cargo 19
            ];

            const [cargos] = await db.query('SELECT id FROM cargos ORDER BY id');
            console.log(`Aplicando distribucion de salarios de prueba para ${cargos.length} cargos...`);
            
            for (let i = 0; i < cargos.length; i++) {
                const id = cargos[i].id;
                // Si hay menos salarios definidos en el array que cargos existentes, usar el ultimo salario
                const salario = salariosPrueba[i] !== undefined ? salariosPrueba[i] : salariosPrueba[salariosPrueba.length - 1];
                await db.query('UPDATE cargos SET salario_base = ? WHERE id = ?', [salario, id]);
            }
            
            console.log('Distribucion de salarios de prueba aplicada exitosamente.');
            process.exit(0);
        }

        if (comando === 'restaurar') {
            // Restaura los salarios basicos iniciales
            const salariosBase = {
                1: 365.00,
                2: 450.00,
                3: 800.00
            };
            
            const [cargos] = await db.query('SELECT id FROM cargos');
            console.log('Restaurando salarios base de fabrica...');
            
            for (const cargo of cargos) {
                const salarioDefault = salariosBase[cargo.id] || 365.00;
                await db.query('UPDATE cargos SET salario_base = ? WHERE id = ?', [salarioDefault, cargo.id]);
            }
            
            console.log('Salarios base restaurados exitosamente.');
            process.exit(0);
        }

        // Si es un numero, aplicar salario fijo a todos
        const salarioFijo = parseFloat(comando);
        if (isNaN(salarioFijo) || salarioFijo <= 0) {
            console.error('Error: El argumento especificado debe ser un numero positivo, "distribuir" o "restaurar".');
            process.exit(1);
        }

        console.log(`Estableciendo salario base de $${salarioFijo.toFixed(2)} para todos los cargos...`);
        const [result] = await db.query('UPDATE cargos SET salario_base = ?', [salarioFijo]);
        console.log(`Se actualizaron ${result.affectedRows} filas de cargos.`);
        process.exit(0);

    } catch (error) {
        console.error('Error al ejecutar el script:', error);
        process.exit(1);
    }
}

main();
