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

### 2. Mapeo de Campos del Formato Planilla (Actualizado)

La tabla en la UI muestra exactamente las columnas especificadas, mapeadas de la siguiente forma a partir de la boleta de pago y datos del empleado:

| N° | Columna del Formato | Origen del Dato / Calculo |
| :--- | :--- | :--- |
| 1 | **N°** | Indice incremental de fila (1, 2, 3...) |
| 2 | **Area** | Departamento del colaborador (`b.area` desde `rh_departamentos.nombre`) |
| 3 | **Puesto** | Cargo del colaborador (`b.cargo` desde `cargos.titulo`) |
| 4 | **Fecha de ingreso** | Fecha de contratacion del colaborador (`b.fecha_ingreso`) |
| 5 | **Fecha de corte de la planilla** | Fecha fin del periodo de planilla (`planilla.fecha_fin`) |
| 6 | **Sueldo-Salario** | Salario nominal base asignado (`b.salario_base`) |
| 7 | **Viaticos** | Reembolso de gastos obtenido directamente de la BD (`b.viaticos`) |
| 8 | **Mes que ingreso a la empresa** | Mes en formato numerico sin ceros a la izquierda (ej. "8" para Agosto) obtenido de la fecha de ingreso |
| 9 | **Tiempo en la empresa (años)** | Diferencia en años calculada con precision de dos decimales (ej. "8.49") entre fecha de ingreso y fecha de corte |
| 10 | **Horas extras diurnas** | Monto de horas extras diurnas obtenido directamente de la BD (`b.horas_extras_diurnas`) |
| 11 | **Horas extras nocturnas** | Monto de horas extras nocturnas obtenido directamente de la BD (`b.horas_extras_nocturnas`) |
| 12 | **Monto de vacaciones** | Vacacion ordinaria proporcional calculada: `b.vacaciones / 1.30` |
| 13 | **Bonificacion de vacaciones** | Prima del 30% de ley sobre vacacion: `(b.vacaciones / 1.30) * 0.30` |
| 14 | **Monto del aguinaldo** | Aguinaldo devengado en el periodo (`b.aguinaldo`) |
| 15 | **Quincena Veinticinco** | Prestacion exenta del Decreto N.° 499 (`b.quincena_veinticinco`) |
| 16 | **Monto cotizables para cotizaciones** | Salario cotizable para ISSS/AFP: `salario_devengado - aguinaldo - quincena_veinticinco - viaticos` |
| 17 | **ISSS Patronal** | Aporte patronal ISSS (7.50% hasta techo de $1,000.00) (`b.isss_patrono`) |
| 18 | **AFP Patronal** | Aporte patronal AFP (8.75% hasta techo de $7,028.29) (`b.afp_patrono`) |
| 19 | **ISSS Empleado** | Retencion ISSS empleado (3.00% hasta techo de $1,000.00) (`b.isss_empleado`). Se visualiza con signo negativo. |
| 20 | **AFP Empleado** | Retencion AFP empleado (7.25% hasta techo de $7,028.29) (`b.afp_empleado`). Se visualiza con signo negativo. |
| 21 | **Impuesto sobre la Renta (ISR)** | Impuesto sobre la Renta retenido al empleado (`b.renta`). Se visualiza con signo negativo. |
| 22 | **Monto a depositar al empleado** | Liquido a pagar depositado al empleado (`b.salario_neto`) |
| 23 | **Monto a depositar planilla unica** | Total de contribuciones (ISSS + AFP, de empleado y patrono) + ISR. Se visualiza con color rojo oscuro en los totales. |

---

## 3. Justificacion de Valores Negativos (ISSS, AFP, Renta)

En la columna del reporte detallado para los aportes de **ISSS Empleado**, **AFP Empleado** y **ISR (Renta)**, los valores numericos se muestran con un signo negativo antepuesto (`-`). 

Esta presentacion visual obedece a las siguientes razones de control y legibilidad:
1. **Deducciones Salariales:** Representan descuentos directos que disminuyen el salario nominal devengado del colaborador para obtener el neto a depositar. El signo menos clarifica la naturaleza de la operacion matematica de sustraccion de cara a auditorias internas.
2. **Consistencia Contable:** Permite al administrador distinguir rapidamente entre los flujos que aumentan el salario neto (salario, viaticos, horas extras, aguinaldo) y los flujos que reducen el neto recibido por el empleado (deducciones previsionales y tributarias).

---

## 4. Criterios de Diseño Cromático y Legibilidad

Para optimizar la legibilidad de la grilla extendida (que contiene mas de 20 columnas de informacion tecnica de nomina) se aplicaron cambios de saneamiento visual segun las directrices del frontend:
* **Fondo y Texto Plano:** Se eliminaron los fondos de colores en las celdas individuales (como azul, verde, gris y morado) y se removieron los colores del texto de los colaboradores y de las deducciones, usando unicamente texto negro (`text-slate-900` / `text-slate-800` en modo claro) o blanco/gris en modo oscuro para el cuerpo y cabecera de la tabla.
* **Enfoque de Totales Financieros:** Unicamente se permite el uso de color en la ultima fila correspondiente a los totales consolidados (**TOTAL PLANILLA**):
    * **Neto a Depositar (Flujo de Pago):** Se resalta en **color verde negrita** (`text-emerald-800` / `dark:text-emerald-400`) para marcar la salida del flujo monetario principal destinado a los colaboradores de la empresa.
    * **Planilla Unica (Flujo de Impuestos y Previsión):** Se resalta en **color rojo oscuro negrita** (`text-red-800` / `dark:text-red-400`) para marcar la salida del flujo monetario correspondiente a retenciones previsionales e impuestos de ley de El Salvador.

---

## 5. Script de Modificacion de Salarios Base (Pruebas)

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

## 6. Caracteristicas de la UI

* **Visualizacion en Grilla Adaptativa:** La tabla se renderiza en un contenedor con scroll horizontal suave, protegiendo el layout general del dashboard.
* **Busqueda en Tiempo Real:** Permite filtrar instantaneamente la nomina por nombre de colaborador o cargo.
* **Filtro por Area:** Desplegable dinamico que aisla y muestra unicamente los empleados de un departamento.
* **Totales en Vivo:** Al pie de la tabla se recalculan dinamicamente las sumas de todas las columnas monetarias de acuerdo al filtro aplicado.
* **Exportacion a Excel:** Genera un archivo CSV con formato UTF-8 (BOM incluido) para que Microsoft Excel abra correctamente las tildes, la letra Ñ y los simbolos de moneda.
* **Impresion Optimizada:** CSS especifico que oculta la navegacion y formatea la grilla de forma horizontal (Landscape) a tamano de letra optimo para su presentacion fisica.
