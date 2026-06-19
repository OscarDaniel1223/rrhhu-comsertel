# Reporte de Planilla Consolidada (Formato Extendido)

Este documento detalla la arquitectura e implementacion de la nueva UI de visualizacion, exportacion e impresion de planillas bajo el formato unico extendido solicitado por administracion, asi como el script de automatizacion de salarios base para pruebas.

---

## 1. Archivos Involucrados

La solucion se ha implementado de forma modular, garantizando no alterar ninguna de las pantallas o flujos de planillas y boletas individuales ya existentes.

### Backend:
* **[v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js):** Se modifico la consulta SQL `boletasQuery` en la funcion `getPlanillaById` para incluir mediante `JOIN` el departamento (como `area`) y la fecha de ingreso del empleado utilizando la tabla `rh_departamentos`.
* **[actualizar_salarios.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/actualizar_salarios.js):** Script de utilidad en Node.js para listar y modificar masivamente los salarios de la tabla `cargos` para QA.

### Frontend:
* **[V2_ContenedorPlanillaFormato.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/V2_ContenedorPlanillaFormato.jsx):** Nuevo componente React que renderiza la matriz gigante de datos de nomina y provee exportacion a Excel e impresion landscape.
* **[menuConfig.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/services/menuConfig.js):** Se registro la opcion de menu "Reporte Planilla" (id: `payroll_format`).
* **[useRenderContent.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/hooks/useRenderContent.jsx):** Se vinculo el id `payroll_format` para renderizar el nuevo contenedor del reporte.

---

## 2. Mapeo de Campos del Formato Planilla

La tabla en la UI muestra exactamente las columnas especificadas, mapeadas de la siguiente forma a partir de la boleta de pago y datos del empleado:

| N° | Columna del Formato | Origen del Dato / Calculo |
| :--- | :--- | :--- |
| 1 | **N°** | Indice incremental de fila (1, 2, 3...) |
| 2 | **Area** | Departamento del colaborador (`b.area` desde `departamentos.nombre`) |
| 3 | **Puesto** | Cargo del colaborador (`b.cargo` desde `cargos.titulo`) |
| 4 | **Fecha de ingreso** | Fecha de contratacion del colaborador (`b.fecha_ingreso`) |
| 5 | **Fecha de corte de la planilla** | Fecha fin del periodo de planilla (`planilla.fecha_fin`) |
| 6 | **Sueldo-Salario** | Salario nominal base asignado (`b.salario_base`) |
| 7 | **Viaticos** | Por defecto `$0.00` (no parametrizado en BD actual) |
| 8 | **Mes que ingreso a la empresa** | Nombre del mes obtenido de la fecha de ingreso |
| 9 | **Tiempo en la empresa (años)** | Diferencia en años entre fecha de ingreso y fecha de corte |
| 10 | **Horas extras diurnas** | Por defecto `$0.00` (no parametrizado en BD actual) |
| 11 | **Horas extras nocturnas** | Por defecto `$0.00` (no parametrizado en BD actual) |
| 12 | **Monto de vacaciones** | Vacacion ordinaria proporcional calculada: `b.vacaciones / 1.30` |
| 13 | **Bonificacion de vacaciones** | Prima del 30% de ley sobre vacacion: `(b.vacaciones / 1.30) * 0.30` |
| 14 | **Monto del aguinaldo** | Aguinaldo devengado en el periodo (`b.aguinaldo`) |
| 15 | **Quincena Veinticinco** | Prestacion exenta del Decreto N.° 499 (`b.quincena_veinticinco`) |
| 16 | **Monto cotizables para cotizaciones** | Salario cotizable para ISSS/AFP: `salario_devengado - aguinaldo - quincena_veinticinco` |
| 17 | **ISSS Patronal** | Aporte patronal ISSS (7.50% hasta techo de $1,000.00) (`b.isss_patrono`) |
| 18 | **AFP Patronal** | Aporte patronal AFP (8.75% hasta techo de $7,028.29) (`b.afp_patrono`) |
| 19 | **INCAF** | Aporte patronal INCAF (1.00% hasta techo de $1,000.00) (`b.incaf_patrono`) |
| 20 | **ISSS Empleado** | Retencion ISSS empleado (3.00% hasta techo de $1,000.00) (`b.isss_empleado`) |
| 21 | **AFP Empleado** | Retencion AFP empleado (7.25% hasta techo de $7,028.29) (`b.afp_empleado`) |
| 22 | **Impuesto sobre la Renta (ISR)** | Impuesto sobre la Renta retenido al empleado (`b.renta`) |
| 23 | **Monto a depositar al empleado** | Liquido a pagar depositado al empleado (`b.salario_neto`) |
| 24 | **Monto a depositar planilla unica** | Total de contribuciones (ISSS + AFP + INCAF, de empleado y patrono) + ISR |

---

## 3. Script de Modificacion de Salarios Base (Pruebas)

Para realizar pruebas con distintos rangos salariales sin alterar manualmente la base de datos, se desarrollo el script `actualizar_salarios.js`.

### Comandos Disponibles:
1. **Listar Cargos y Salarios:**
   ```bash
   node actualizar_salarios.js
   ```
2. **Establecer un Salario Fijo a Todos los Cargos:**
   ```bash
   node actualizar_salarios.js 450
   ```
   *(Establecera $450.00 como salario base para todos los cargos en la base de datos)*.

3. **Distribuir Salarios de Prueba Sistematicamente:**
   ```bash
   node actualizar_salarios.js distribuir
   ```
   *(Asigna una gama de salarios desde $365.00 hasta $7,500.00 a los 19 cargos del sistema para simular todos los tramos de renta, cotizaciones e ISSS/AFP)*.

4. **Restaurar Salarios Originales:**
   ```bash
   node actualizar_salarios.js restaurar
   ```
   *(Vuelve a colocar los salarios de fabrica)*.

---

## 4. Caracteristicas de la UI

* **Visualizacion en Grilla Adaptativa:** La tabla se renderiza en un contenedor con scroll horizontal suave, protegiendo el layout general del dashboard.
* **Busqueda en Tiempo Real:** Permite filtrar instantaneamente la nomina por nombre de colaborador o cargo.
* **Filtro por Area:** Desplegable dinamico que aisla y muestra unicamente los empleados de un departamento.
* **Totales en Vivo:** Al pie de la tabla se recalculan dinamicamente las sumas de todas las columnas monetarias de acuerdo al filtro aplicado.
* **Exportacion a Excel:** Genera un archivo CSV con formato UTF-8 (BOM incluido) para que Microsoft Excel abra correctamente las tildes, la letra Ñ y los simbolos de moneda.
* **Impresion Optimizada:** CSS especifico que oculta la navegacion y formatea la grilla de forma horizontal (Landscape) a tamano de letra optimo para su presentacion fisica.
