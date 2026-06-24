# Registro de Viaticos y Horas Extras en Nomina (Sprint 5)

Este documento detalla la arquitectura e implementacion del soporte fisico para viaticos y horas extras diurnas/nocturnas en el sistema de planillas, cubriendo base de datos, logica de calculo de nomina (backend) e interfaces de usuario (frontend).

---

## 1. Modificaciones en el Modelo de Base de Datos

Para persistir los valores de viaticos e incidencias de horas extras calculados y procesados en cada planilla, se agregaron columnas especificas a la tabla `boletas_pago` mediante el script de migracion `backend/scripts/migrar_novedades.js`.

Las columnas añadidas son:
* **`viaticos`** `DECIMAL(10, 2) DEFAULT 0.00`: Almacena el monto de viaticos asignado al colaborador.
* **`horas_extras_diurnas`** `DECIMAL(10, 2) DEFAULT 0.00`: Almacena el monto monetario liquidado por horas extraordinarias diurnas.
* **`horas_extras_nocturnas`** `DECIMAL(10, 2) DEFAULT 0.00`: Almacena el monto monetario liquidado por horas extraordinarias nocturnas.

### Sentencias SQL Aplicadas:
```sql
ALTER TABLE boletas_pago ADD COLUMN viaticos DECIMAL(10,2) DEFAULT 0.00 AFTER aguinaldo;
ALTER TABLE boletas_pago ADD COLUMN horas_extras_diurnas DECIMAL(10,2) DEFAULT 0.00 AFTER viaticos;
ALTER TABLE boletas_pago ADD COLUMN horas_extras_nocturnas DECIMAL(10,2) DEFAULT 0.00 AFTER horas_extras_diurnas;
```

---

## 2. Logica de Negocio y Calculo de Nomina (Backend)

En el servicio de calculo [v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js), se modifico el metodo `calcularBoletaPago` para incorporar estos nuevos ingresos de acuerdo con la legislacion laboral de El Salvador:

### Reglas de Calculo Aplicadas:
1. **Salario Nominal Devengado:** 
   Los viaticos y las horas extras (diurnas y nocturnas) se suman al salario nominal devengado total del periodo:
   $$\text{Devengado} = \text{Salario Base Proporcional} + \text{Beneficios} + \text{Vacaciones} + \text{Aguinaldo} + \text{Quincena 25} + \text{Horas Extras Diurnas} + \text{Horas Extras Nocturnas} + \text{Viaticos} - \text{Descuento Ausencias}$$

2. **Exencion de Viaticos:** 
   Segun la legislacion salvadoreña, los viaticos representan reembolsos de gastos de viaje y no constituyen salario cotizable ni gravable. Por lo tanto:
   * Se excluyen del calculo de la base cotizable para Seguro Social (ISSS) y Prevision Social (AFP):
     $$\text{Salario Cotizable} = \text{Devengado} - \text{Aguinaldo} - \text{Quincena 25} - \text{Viaticos}$$
   * Se excluyen de la base gravable para el Impuesto sobre la Renta (ISR):
     $$\text{Base Impuesto Renta} = \text{Devengado} - \text{Aguinaldo} - \text{Quincena 25} - \text{Viaticos}$$

3. **Horas Extras Cotizables:** 
   Las horas extras diurnas y nocturnas se consideran ingresos ordinarios gravables y cotizables, por lo que tributan ISSS, AFP e ISR normalmente al no restarse de la base cotizable.

### Persistencia de Datos:
El controlador [v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js) mapea las novedades provenientes de la peticion del frontend, invoca al motor de nomina pasando estos nuevos campos e inserta sus desgloses fisicos en la consulta `INSERT` de la tabla `boletas_pago`.

---

## 3. Interfaz de Usuario y UX (Frontend)

Se realizaron modificaciones estructurales en dos componentes de la aplicacion React para permitir el flujo completo de gestion:

### A. Registro en la Generacion de Planillas:
En el componente [V2_ContenedorPlanilla.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/V2_ContenedorPlanilla.jsx), se agregaron tres columnas en la tabla de entrada de novedades para viaticos y horas extras:
* **Viaticos ($)**: Permite ingresar el monto monetario directamente en dolares de forma manual.
* **Horas Extras Diurnas (Qty)**: Campo numerico de entrada para la cantidad de horas extras diurnas trabajadas (admite decimales, ej. 1.5 o 3.0).
* **Horas Extras Nocturnas (Qty)**: Campo numerico de entrada para la cantidad de horas extras nocturnas trabajadas (admite decimales, ej. 1.5 o 3.0).

#### Calculo Automatico e Interactivo en la Interfaz (Frontend)
Para mejorar la experiencia del usuario y evitar errores en el calculo manual de montos extraordinarios, se incorporo un calculo reactivo y visual. Al digitar una cantidad en los campos de horas extras, se calcula en tiempo real el valor monetario en dolares segun las formulas de ley salvadoreñas, imprimiendose directamente debajo de la casilla de entrada de texto (ej. 4 horas = $15.20 o No aplica si es 0 o esta vacio).

Las formulas aplicadas son:
* **Horas Extras Diurnas**: Tienen un recargo del 100% (pago doble).
  $$\text{Valor Hora Extra Diurna} = \frac{\text{Salario Base Mensual}}{30 \text{ dias} \times 8 \text{ horas}} \times 2 = \frac{\text{Salario Base Mensual}}{120.0}$$
  $$\text{Monto HED} = \text{Cantidad de Horas} \times \frac{\text{Salario Base Mensual}}{120.0}$$
* **Horas Extras Nocturnas**: Tienen un recargo del 100% sobre el valor de la hora nocturna (que ya tiene un recargo del 25% sobre la ordinaria).
  $$\text{Valor Hora Extra Nocturna} = \left(\frac{\text{Salario Base Mensual}}{30 \text{ dias} \times 8 \text{ horas}} \times 1.25\right) \times 2 = \frac{\text{Salario Base Mensual}}{96.0}$$
  $$\text{Monto HEN} = \text{Cantidad de Horas} \times \frac{\text{Salario Base Mensual}}{96.0}$$

#### Mapeo y Envio de Datos al Servidor (POST /api/planillas)
Durante la ejecucion del metodo `handleSubmit`, el componente no envia la cantidad de horas ingresadas al backend. En su lugar:
1. Realiza la conversion automatica a monto monetario multiplicando la cantidad de horas digitada por el factor legal segun el salario base de cada empleado.
2. Redondea el resultado a dos decimales usando `Math.round(valor * 100) / 100`.
3. Envia los montos resultantes en las propiedades estandar `horas_extras_diurnas` y `horas_extras_nocturnas`.
Esto permite mantener la retrocompatibilidad absoluta con la estructura de la base de datos (tabla `boletas_pago`) y los servicios del backend (`v2_payrollService.js` y `v2_planillasController.js`), los cuales procesan y almacenan montos en dolares de manera transparente.

### B. Visualizacion en el Reporte Consolidado:
El componente [V2_ContenedorPlanillaFormato.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/V2_ContenedorPlanillaFormato.jsx) se actualizo para:
* Leer los valores reales de `viaticos`, `horas_extras_diurnas` y `horas_extras_nocturnas` recuperados desde la base de datos para cada boleta.
* Mostrar los valores correspondientes en sus respectivas columnas de la matriz consolidada.
* Recalcular dinamicamente la sumatoria de estas columnas al pie de la tabla en los totales generales y permitir su correcta exportacion en el reporte de formato CSV.

---

## 4. Gestion de Novedades Persistentes por Empleado (Actualizacion Sprint 5)

Para optimizar el flujo operativo, brindar un seguimiento de horas exacto y evitar que los usuarios tengan que digitar de forma manual los viaticos, beneficios y horas extras de los colaboradores al generar una planilla, se diseño e implemento un modulo de persistencia dedicada para novedades de nomina.

### A. Estructura de Persistencia en Base de Datos (Seguimiento Diario):
Se creo la tabla `novedades_empleados` para almacenar de forma diaria los registros de incidencias y viaticos por colaborador:
```sql
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
```

### B. Endpoints de Gestion en el Backend:
* **`GET /api/novedades?fecha=YYYY-MM-DD`**: Obtiene las novedades registradas de un dia especifico para el listado interactivo.
* **`GET /api/novedades?fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD`**: Obtiene el consolidado (suma acumulada) de viaticos, beneficios y horas extras diurnas/nocturnas de cada empleado en el rango de fechas del periodo de pago de la planilla.
* **`POST /api/novedades`**: Guarda o actualiza en bloque (upsert) la lista de novedades para la fecha seleccionada.

### C. Interfaz de Gestion de Novedades y Horas Extras (`V2_ContenedorNovedades.jsx`):
Se desarrollo una interfaz de usuario integrada que implementa pestañas (tabs) para alternar entre dos flujos de trabajo clave:

1. **Pestaña: Registrar Novedades Diarias**:
   * Permite seleccionar el dia y mes de gestion mediante un input nativo de tipo fecha.
   * Maneja de forma segura la limpieza o borrado de dicho input, impidiendo peticiones a la API si la fecha esta vacia o incompleta para evitar caidas de sesion o errores de sistema.
   * Visualiza la lista de colaboradores activos junto con sus respectivos salarios bases mensuales.
   * Permite digitar de manera directa los viaticos, beneficios y la cantidad de horas extras diurnas/nocturnas correspondientes al dia.
   * Muestra de forma reactiva y visual el costo en dolares de las horas extras ingresadas debajo de cada control, computado automaticamente bajo los criterios del Codigo de Trabajo (factor `120.0` para diurnas y `96.0` para nocturnas).
   * Proporciona un boton para guardar la informacion del dia seleccionado con un solo clic.

2. **Pestaña: Historial Acumulado Mensual**:
   * Presenta un selector de mes (`type="month"`) para filtrar el periodo de interes.
   * Consume de forma transparente el endpoint acumulador del backend configurando el rango de fechas completo del mes (desde el dia 1 hasta el ultimo dia calendario del mes seleccionado).
   * Muestra una tabla detallada con los totales acumulados (sumas del mes) de horas extras diurnas y nocturnas (cantidad de horas y su costo en dolares), viaticos y beneficios de cada colaborador.
   * Dispone de un buscador interactivo para filtrar la lista de personal por nombre, cargo o departamento organizativo.

### D. Carga Automatica y Eliminacion de Inputs al Generar Planilla:
* **Carga por Rango**: El componente principal de planillas (`V2_ContenedorPlanilla.jsx`) realiza de forma automatica una peticion al backend consumiendo el endpoint de rango acumulado entre `fecha_inicio` y `fecha_fin` del periodo seleccionado, mapeando los totales cargados para cada empleado en el estado.
* **UI de Solo Lectura**: Se removieron por completo los inputs interactivos de la tabla de entrada de novedades en la UI de Generar Planilla para evitar duplicidad de flujos y modificaciones manuales erroneas. Los valores acumulados de viaticos, beneficios, horas extras diurnas y nocturnas se renderizan ahora como celdas de texto estatico puramente informativas.



