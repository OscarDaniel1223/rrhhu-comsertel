# Solución técnica: Error interno del servidor (500) al generar planilla

Este documento describe la investigación, causa raíz y solución aplicada para resolver el error interno del servidor que ocurría al procesar e intentar generar la planilla de remuneraciones para el periodo mensual/quincenal.

## 1. Síntomas del problema
Al presionar el botón **Procesar y Generar Planilla** en la interfaz de usuario para el mes actual, la petición POST al endpoint `/api/planillas` retornaba un código de estado HTTP 500 con el siguiente mensaje:
```json
{
  "status": "error",
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Error interno del servidor al generar la planilla."
}
```

## 2. Investigación y Causa Raíz
Mediante la ejecución de scripts de diagnóstico y la inspección del esquema de base de datos de MariaDB/MySQL en Docker, se identificaron dos fallas principales en la integración entre la base de datos y el controlador de backend en [v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js):

1. **Campos Inexistentes en la Tabla `boletas_pago`:**
   Al inspeccionar las columnas de la tabla `boletas_pago` con la instrucción `DESCRIBE boletas_pago`, se comprobó que el controlador intentaba insertar datos en las columnas `beneficios`, `vacaciones` y `aguinaldo` para persistir los montos desglosados calculados por el motor de nómina, pero dichas columnas no existían físicamente en la definición de la tabla en la base de datos.
   
2. **Conflicto de Naming con la Columna de Aporte Patronal:**
   En la base de datos, la columna de aporte patronal de capacitación laboral fue renombrada a `incaf_patrono` (acorde al Decreto N.° 893 que cambió el nombre de INSAFORP a INCAF). Sin embargo, la consulta de inserción del controlador seguía intentando escribir en el campo con el nombre obsoleto de `insaforp_patrono`. 
   
Ambos problemas hacían que MySQL lanzara una excepción de columna desconocida (`ER_BAD_FIELD_ERROR: Unknown column 'insaforp_patrono' in 'field list'`), la cual abortaba la transacción, hacía un rollback completo y retornaba el error 500 al frontend.

## 3. Solución Aplicada

Para resolver de manera definitiva este error, se realizaron las siguientes acciones correctivas:

### A. Modificación del Esquema de Base de Datos
Se ejecutaron sentencias `ALTER TABLE` para agregar de forma física los campos requeridos en la tabla `boletas_pago` y permitir almacenar los cálculos de novedades de nómina:
```sql
ALTER TABLE boletas_pago ADD COLUMN beneficios DECIMAL(10,2) DEFAULT '0.00' AFTER incaf_patrono;
ALTER TABLE boletas_pago ADD COLUMN vacaciones DECIMAL(10,2) DEFAULT '0.00' AFTER beneficios;
ALTER TABLE boletas_pago ADD COLUMN aguinaldo DECIMAL(10,2) DEFAULT '0.00' AFTER vacaciones;
```

### B. Corrección en el Backend (Controlador de Planillas)
En [v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js):
1. Se cambió el nombre del parámetro `insaforp_patrono` a `incaf_patrono` en la consulta `INSERT` del bloque transaccional:
   ```javascript
   // Guardar en la base de datos la boleta de pago consolidada
   await connection.query(
       `INSERT INTO boletas_pago (
           id_planilla, id_empleado, dias_trabajados, salario_devengado,
           isss_empleado, afp_empleado, renta, salario_neto,
           isss_patrono, afp_patrono, incaf_patrono,
           beneficios, vacaciones, aguinaldo, quincena_veinticinco
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
       [ ... ]
   );
   ```
2. Para mantener la retrocompatibilidad con el frontend sin alterar múltiples componentes que consumen la API y esperan la nomenclatura anterior, se utilizó un alias SQL en la consulta de obtención del detalle en `getPlanillaById`:
   ```javascript
   const boletasQuery = `
       SELECT b.*, b.incaf_patrono AS insaforp_patrono, e.nombres, e.apellidos, e.dui, e.nit, c.titulo AS cargo, c.salario_base
       FROM boletas_pago b
       JOIN empleados e ON b.id_empleado = e.id
       JOIN cargos c ON e.id_cargo = c.id
       WHERE b.id_planilla = ?
   `;
   ```

## 4. Verificación
El proceso fue validado localmente simulando peticiones HTTP exitosas hacia el controlador, confirmando que las planillas mensuales/quincenales del periodo actual se procesan, guardan y consultan correctamente (retornando un código de estado `201 Created` en lugar del error `500`).
