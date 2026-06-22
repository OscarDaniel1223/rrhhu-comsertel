# Detalles de Arquitectura: Módulo de Programación de Aguinaldos

Este documento describe la arquitectura de software y las modificaciones técnicas realizadas en la base de datos, el backend y el frontend para implementar el módulo de calendarización y programación del pago de aguinaldos.

---

## 1. Modificaciones en la Base de Datos

Se agregó una columna a la tabla principal de empleados para almacenar la fecha calendarizada del pago del aguinaldo.

*   **Tabla:** `empleados`
*   **Columna Añadida:** `fecha_aguinaldo` (Tipo: `DATE`, admite valores nulos, por defecto `NULL`).
*   **Comando de Migración Aplicado:**
    ```sql
    ALTER TABLE empleados ADD COLUMN fecha_aguinaldo DATE DEFAULT NULL AFTER mes_vacaciones;
    ```
*   Esta columna se documentó y agregó en el archivo de referencia de la estructura de la base de datos [consolidado-base.md](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/consolidado-base.md).

---

## 2. Modificaciones en el Backend (API)

*   **Modelo y Consultas de Empleados ([v2_empleadosController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_empleadosController.js)):**
    Se actualizaron las consultas SQL de los métodos `getEmpleados` y `getEmpleadoById` para recuperar el campo `fecha_aguinaldo`. Se agregó el método `programarAguinaldo` para manejar peticiones HTTP PUT.

*   **Rutas de Empleados ([v2_empleados.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/routes/v2_empleados.js)):**
    Se registró el endpoint PUT:
    ```javascript
    router.put('/empleados/:id/aguinaldo-fecha', programarAguinaldo);
    ```

*   **Controlador de Planillas ([v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js)):**
    *   Se incluyó `e.fecha_aguinaldo` en la consulta que recupera a los empleados activos al momento de generar la planilla.
    *   Se reemplazó la validación estática de fecha de corte anual por una validación de coincidencia de período:
        ```javascript
        if (empleado.fecha_aguinaldo) {
            const fAguinaldo = new Date(empleado.fecha_aguinaldo + 'T00:00:00');
            const fInicio = new Date(fecha_inicio + 'T00:00:00');
            const fFin = new Date(fecha_fin + 'T00:00:00');
            
            if (fAguinaldo >= fInicio && fAguinaldo <= fFin) {
                aguinaldoVal = V2_PayrollService.calcularAguinaldo(salarioBase, fechaIngreso, fecha_fin);
            }
        }
        ```

---

## 3. Modificaciones en el Frontend (Interfaz de Usuario)

*   **Servicio ([v2_empleadoService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/services/employees/v2_empleadoService.js)):**
    Se exportó e implementó la función `programarAguinaldo(id, fechaAguinaldo)` para consumir la API de actualización.
*   **Menú de Navegación ([menuConfig.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/services/menuConfig.js)):**
    Se añadió el elemento de menú `{ id: "bono_programming", label: "Programar Aguinaldos", icon: "bi-gift", ... }`.
*   **Renderizador de Vistas ([useRenderContent.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/hooks/useRenderContent.jsx)):**
    Se importó y vinculó el caso `bono_programming` para desplegar el componente de aguinaldo.
*   **Componente de Programación ([V2_ContenedorProgramacionAguinaldo.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/contents/employees/V2_ContenedorProgramacionAguinaldo.jsx)):**
    Nuevo componente en React que muestra el listado de personal activo e inactivo y provee un control de tipo `<input type="date">` para calendarizar la fecha de pago exacta para cada empleado.
    
    ### Mecánica de Operaciones Masivas (Lote):
    *   **Selección en Lote:** Checkbox en el header `<th>` de la tabla para seleccionar/deseleccionar todas las filas que coincidan con la búsqueda activa.
    *   **Asignación Concurrente Resiliente:** Se utiliza `Promise.all` para ejecutar de manera paralela y asíncrona múltiples llamados al servicio de actualización del backend para todos los empleados del conjunto seleccionado, controlando adecuadamente las transiciones visuales de carga. Cada promesa individual atrapa sus propios errores (`try-catch` a nivel de iterador) para evitar que una falla aislada aborte la cola de peticiones masivas.
    
    ### Usabilidad y Disponibilidad del Input de Fecha Masiva:
    *   Se removió la restricción `disabled` del campo de fecha masiva (`bulkDate`). Ahora el patrono puede interactuar y definir la fecha del lote en cualquier momento, independientemente de si hay o no empleados seleccionados previamente en la tabla.
    
    ### Restricciones y Validación de Rango (20 Oct - 20 Dic):
    *   Se implementó la función utilitaria `esFechaValidaAguinaldo(fechaStr)` en el frontend para validar que el mes y día de la fecha seleccionada caiga estrictamente dentro del rango de pago permitido: entre el **20 de octubre** y el **20 de diciembre** de cada año.
    *   Tanto en la programación individual como en la asignación masiva de lote se verifica esta condición. Si el usuario ingresa una fecha que no satisface este rango, la interfaz interrumpe el flujo, muestra una alerta de error (`Swal.fire`) y bloquea el envío de la petición PUT al backend.
    *   Se incorporó un banner de anuncio visual informativo en la parte superior de la vista detallando esta regla y restricción legal.

---

## 4. Detalles Técnicos de la Integración en "Generar Planilla"

*   **Robustecimiento del Backend ([v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js)):**
    Se reemplazó el parsing directo de fechas por la función auxiliar `parseFecha` en el controlador. Esto evita fallos del tipo `Invalid Date` cuando el driver `mysql2` devuelve el campo `fecha_aguinaldo` como un objeto `Date` en lugar de string, o cuando existen desfases de zona horaria local.
    ```javascript
    const parseFecha = (f) => {
        if (!f) return null;
        if (f instanceof Date) {
            return new Date(f.getFullYear(), f.getMonth(), f.getDate());
        }
        const str = f.toString().split('T')[0];
        const partes = str.split('-');
        if (partes.length === 3) {
            return new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
        }
        const d = new Date(f);
        return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };
    ```

*   **Lógica Orientativa del Frontend ([V2_ContenedorPlanilla.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/contents/employees/V2_ContenedorPlanilla.jsx)):**
    *   **Función `calcularAguinaldoFrontend`:** Implementa en Javascript del lado del cliente el algoritmo del motor de nómina para calcular el aguinaldo en base al salario base y antigüedad (Art. 196-198) al 20 de octubre.
    *   **Extracción y Evaluación Reactiva:** Al cambiar el mes o período, se calcula dinámicamente si la `fecha_aguinaldo` del colaborador cae dentro de `[fechaInicio, fechaFin]`.
    *   **Columna Informativa:** Se añadió la columna **Aguinaldo Programado ($)** en la tabla de Novedades. Si la fecha cae en el rango, se visualiza en verde destacado con el monto correspondiente; en caso contrario, se muestra en gris como `Fuera de período (Fecha)` o `No programado`.
    *   **Banner Dinámico:** Se agregó un aviso de alerta en verde en la sección de Novedades para reportar el total de aguinaldos que el sistema procesará automáticamente.

