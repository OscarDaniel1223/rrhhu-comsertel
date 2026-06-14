# Solucion de Error de Visualizacion de Fecha (Invalid Date) en Historial de Planillas

Este documento detalla el diagnostico, las alternativas evaluadas y la solucion implementada para corregir el error que mostraba "Invalid Date al Invalid Date" en la visualizacion del rango de fechas del periodo de nomina en el historial de planillas.

## 1. Diagnostico del Problema

El fallo se originaba debido a una discrepancia en como se transmiten y manipulan las fechas entre la base de datos MariaDB, el backend en Node.js y el frontend en React.

1. **Tipo de Dato en Base de Datos:** En la tabla `planillas`, las columnas `fecha_inicio` y `fecha_fin` estan definidas como tipo `DATE`.
2. **Serializacion del Backend:** Al consultar estas columnas en Node.js mediante el driver de conexion a MariaDB (`mysql2`), los campos se parsean automaticamente como objetos `Date` nativos de JavaScript.
3. **Envio JSON:** Al enviar las respuestas mediante `res.json()`, estos objetos `Date` se serializan a formato de cadena ISO completo (ejemplo: `"2026-06-01T06:00:00.000Z"`).
4. **Manipulacion en el Frontend:** El codigo original del frontend intentaba crear un objeto de fecha local concatenando la cadena `'T00:00:00'` a la fecha provista por la API:
   `new Date(p.fecha_inicio + 'T00:00:00')`
   Esto producia una cadena mal formada (`"2026-06-01T06:00:00.000ZT00:00:00"`), lo cual es rechazado por el motor de JavaScript y resulta en un objeto `Date` invalido (`Invalid Date`).

## 2. Alternativas Identificadas

Para resolver este inconveniente, se evaluaron tres alternativas:

### Alternativa A: Limpieza de cadenas en el Frontend (Solucion Seleccionada)
Consiste en implementar una funcion helper en el frontend que detecte si la cadena recibida es un formato ISO completo (contiene la letra 'T') y extraiga unicamente los primeros 10 caracteres correspondientes al formato `YYYY-MM-DD`. Posteriormente, se crea el objeto de fecha agregando `'T00:00:00'`.
* **Ventajas:** Es segura, modular, no requiere alterar configuraciones globales del backend o del driver de conexion, y es tolerante a fallos si el formato de la API cambia en el futuro.

### Alternativa B: Formateo en la Consulta SQL
Consiste en modificar la consulta SQL en el backend para forzar el formato usando `DATE_FORMAT(fecha_inicio, '%Y-%m-%d')`.
* **Desventajas:** Obliga a dar mantenimiento al codigo SQL de cada consulta en lugar de resolver el problema en el flujo de renderizado general.

### Alternativa C: Configuracion Global del Driver de BD
Consiste en configurar `mysql2` para deshabilitar el parseo de columnas `DATE` como objetos de JavaScript, devolviendolas como cadenas de texto directamente.
* **Desventajas:** Puede causar efectos secundarios no deseados en otros modulos del sistema que si requieran el objeto de fecha nativo en el backend.

## 3. Solucion Implementada

Se opto por la **Alternativa A** al ser la mas robusta e independiente de factores externos de infraestructura. Se crearon las siguientes funciones helper en la cabecera de `V2_ContenedorPlanilla.jsx`:

```javascript
const parseFechaLocal = (fechaInput) => {
    if (!fechaInput) return null;
    if (fechaInput instanceof Date) {
        return new Date(fechaInput.getFullYear(), fechaInput.getMonth(), fechaInput.getDate());
    }
    let dateStr = fechaInput.toString();
    if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
    }
    const date = new Date(dateStr + 'T00:00:00');
    return isNaN(date.getTime()) ? null : date;
};

const formatFechaLocal = (fechaInput) => {
    const date = parseFechaLocal(fechaInput);
    if (!date) return 'Invalid Date';
    return date.toLocaleDateString('es-SV');
};
```

Estas funciones se aplicaron en todos los modulos donde se visualizan o procesan rangos de fechas de planillas, incluyendo la tabla del historial, la vista detallada de la planilla y la boleta de pago individual. Con esto, se garantiza una visualizacion limpia de fechas locales en formato de El Salvador (`es-SV`) sin desfases de zona horaria.
