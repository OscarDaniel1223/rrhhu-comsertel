# Planificación de Sprints: Migración Comsertel RH

Este documento organiza el trabajo para el grupo de 5 estudiantes. 
- **Desarrolladores (3):** Encargados de lógica, BD y UI.
- **Apoyo/QA (2):** Encargados de pruebas, documentación de API y validación de datos.

## Sprint 1: Cimentación y Estructura (1 Semana)
**Objetivo:** Tener la nueva base de datos relacional lista y el primer CRUD de catálogos funcionales.

- **Tarea 1 (DB):** Montar MariaDB en Docker e importar el esquema `comsertel_rh`, asegurando la creación de las tablas principales (`departamentos`, `cargos`, `empleados`) y operativas (`ausencias_incapacidades`, `planillas`, `boletas_pago`). (Dev 1)
- **Tarea 2 (Backend):** Crear controladores y endpoints CRUD para las tablas `departamentos` (evitando redundancia de datos) y `cargos` (asignando el salario base correspondiente) usando `Async/Await`. (Dev 2)
- **Tarea 3 (Frontend):** Configurar la instancia de Axios y crear el primer layout limpio con Tailwind CSS para el Dashboard principal. (Dev 3)
- **Tarea 4 (Frontend):** Desarrollar las interfaces de administración de datos para los catálogos de Departamentos y Cargos. (Dev 3)
- **Tarea 5 (Apoyo):** Documentar los nuevos endpoints de departamentos y cargos en el archivo `API.md` y preparar datos de prueba realistas en SQL. (Apoyo 1 y 2)

## Sprint 2: El Corazón del Sistema - Empleados (1 Semana)
**Objetivo:** Gestión completa de empleados vinculados a cargos y departamentos.

- **Tarea 1 (Backend):** Desarrollar los endpoints principales para administrar los empleados, incluyendo el CRUD completo con `JOINs` para traer cargo y departamento en una sola consulta. (Dev 1)
- **Tarea 2 (Frontend):** Diseñar y programar el formulario dinámico de Registro de Empleados (cargando los select de cargos y departamentos desde la API). (Dev 2)
- **Tarea 3 (Frontend):** Crear la tabla de empleados para listar y dar de baja, utilizando únicamente Tailwind CSS y eliminando residuos de Bootstrap. (Dev 3)
- **Tarea 4 (Frontend):** Crear el componente `V2_ContenedorEmpleado` con pestañas para alternar entre el formulario y la tabla de empleados, e integrarlo en `Navbar.jsx` para su despliegue en `dashboard.jsx`. (Dev 3)
- **Tarea 5 (QA):** Validar que los campos DUI y NIT de los empleados cumplan estrictamente con el formato legal salvadoreño. (Apoyo 1 y 2)

## Sprint 3: Control de Tiempo, Ausencias y Lógica de Prestaciones (1 Semana)
**Objetivo:** Registrar incidencias operativas y desarrollar las funciones de cálculo de nómina y prestaciones de ley.

- **Tarea 1 (Backend):** CRUD para el módulo de `ausencias_incapacidades` que permita registrar ausencias injustificadas, permisos con goce de sueldo e incapacidades del ISSS. (Dev 1)
- **Tarea 2 (Frontend):** Desarrollar la vista de historial de ausencias por empleado. (Dev 2)
- **Tarea 3 (Frontend):** Construir la pantalla de gestión operativa para visualizar, aprobar o rechazar las solicitudes de ausencias, permisos e incapacidades. (Dev 2)
- **Tarea 4 (Lógica/Backend):** Programar las utilidades de cálculo de nómina:
  - Salario Nominal Devengado (sumando beneficios y restando ausencias no remuneradas al salario base).
  - Deducciones de ley de El Salvador: retención de ISSS (3%) y AFP (7.25%) sobre el salario devengado.
  - Retención de Renta ubicando el salario gravado en la tabla oficial de retención del Ministerio de Hacienda (Tramos II, III o IV) para montos superiores a $550.00. (Dev 3)
- **Tarea 5 (Lógica/Backend):** Implementar la evaluación y cálculo de prestaciones especiales como Aguinaldo y Vacaciones proporcionales según los años de servicio. (Dev 3)
- **Tarea 6 (Docs):** Actualizar los manuales de usuario para el registro de incapacidades y trámites ante el ISSS. (Apoyo 1 y 2)

## Sprint 4: Gran Final - Planilla y Boletas (1 Semana)
**Objetivo:** Procesamiento de planillas por periodo, costeo patronal y generación de boletas individuales.

- [x] **Tarea 1 (Backend):** Desarrollar el endpoint para "Generar Planilla" que procese los cálculos de todos los empleados activos, registre los aportes patronales (ISSS 7.5%, AFP 8.75%, INCAF 1%) y guarde la información consolidada en `boletas_pago`. (Completado)
- [x] **Tarea 2 (Frontend):** Diseñar e implementar la vista de "Boleta de Pago" individual optimizada para impresión, mostrando días trabajados, salario devengado, desglose de descuentos de ley, total neto a pagar y aportes patronales. (Completado)
- [x] **Tarea 3 (Frontend):** Crear la interfaz para gestionar los encabezados de las Planillas, cubriendo periodos quincenales y mensuales, y permitiendo controlar los estados de planilla (Borrador / Cerrada). (Completado)
- [ ] **Tarea 4 (Frontend):** Desarrollar el Dashboard consolidado con el resumen de costos patronales totales del periodo. (Pendiente - Dev 3)
- [ ] **Tarea 5 (QA/Entrega):** Realizar pruebas de punta a punta (E2E), verificar la consistencia de los calculos con datos reales y llevar a cabo la limpieza final de archivos y dependencias obsoletas. (Pendiente - Todo el grupo)

## Sprint 5: Refinamiento de la Interfaz y Estados de Empleados (1 Semana)
**Objetivo:** Adaptar los componentes clave al modo oscuro y optimizar la gestion de estados de empleados en la base de datos y la interfaz de usuario.

- [x] **Tarea 1 (Frontend):** Implementar y dar soporte completo de modo oscuro (`dark:`) al footer general, contenedor de empleados, tabla de empleados y formulario de empleados.
- [x] **Tarea 2 (Frontend/Backend):** En la tabla de empleados, sustituir el boton de eliminacion directa por una opcion para "Dar de baja", la cual actualizara el estado del empleado a "INACTIVO" en la base de datos.
- [x] **Tarea 3 (Frontend):** Agregar un filtro interactivo en la interfaz de la tabla de empleados para clasificar y ver colaboradores segun su estado (activos, inactivos o todos).
- [x] **Tarea 4 (Frontend):** Configurar la accion del boton de modificacion (icono del lapiz) en la tabla de empleados para redireccionar a la seccion de registro de empleado, precargando el formulario con los datos correspondientes y alternando los botones de accion a "Guardar cambios" y "Cancelar edicion".
- [x] **Tarea 5 (Frontend):** Agrupar el historial de planillas y la creacion de nuevas planillas en un componente contenedor unificado que permita alternar entre estas secciones de forma fluida (siguiendo el modelo implementado para las ausencias).
- [x] **Tarea 6 (Frontend):** Ajustar los estilos de impresion (usando @media print) en la boleta de pago para que al imprimir unicamente se procese la boleta individual propiamente dicha, excluyendo componentes del dashboard, tablas y resumenes para limitar la impresion a una sola pagina limpia.
- **Tarea 7 (Frontend):** En historial de asencia UI al darc click en el boton de modificar(lapiz) del listado solo los colaboradores pares no se carga el nombre en el formulario Registrar incidencias
- **Tarea 8 (Frontend):** Agragar un filtrado por frecuencia para mostrar las planillas quincenale y las mensuales, A la tabla historial planillas quitar el ID PLANILLA, cambiarlo a simple numeracion del 1 al 24 si es quincenal, del 1 al 12 si es mensual
- [x] **Tarea 9 (Frontend):** en la tabla historial de planilla agregar filtro por año y mes (Completado)
- [x] **Tarea 10 (Frontend):** en la tabla historial de planilla se visuliza Invalid Date al Invalid Date identificar por que pasa eso, dar alternativas para su arreglo y luego de arreglarlo documentarlo (Completado)
- [x] **Tarea 11 (Frontend y backend):** en Generar planilla en la seccion CONFIGURACION PERIODO PLANILLA, se queda TIPO DE PERIODO, FECHA INICIO Y FECHA FIN deben completarse automaticamente Al seleccionar un mes por tanto FECHA INICIO Y FECHA FIN desaparecen de la UI y se cambia MES ACTUAL, Validando que no se pueda generar meses pasados al actual, tampoco se puede generar planilla para el mes siguiente hasta que el mes actual no este en estado cerrado (Completado)
- [x] **Tarea 12 (Frontend):** Se cuestiona los apartados de Beneficios / Comisiones en el consolidado-base.md no se ve Vacaciones a Pagar  se deberia cual automaticamente, como prestaciones, vaciones, renta, aguinaldo, quincena, etc. (Completado)
- [x] **Tarea 13 (Frontend):** en Resumen de Planilla quitar, Total Devengado, Total Retenciones (Deducciones), Total Líquido a Pagar, Coste Total Patronal que si no me equivoco son cards en todo caso retangulos con bordes redondeados y mostrarlos al final de la tabla Detalle de Empleados en Planilla como totales execto Coste Total Patronal (Completado)
- [x] **Tarea 14 (Frontend):** Fusionar Consolidado Fiscal y de Seguridad Social con Resumen de Planilla en una sola card y luego sigue la tabla arriba donde aparece Estado: CERRADA agregar un boton de imprimir todas las boletas de pago y un boton de importar a csv (Completado)

- [x] **Tarea 15 (Frontend):** unir la tarjeta Resumen de planilla con Consolidado General de Costos y Prestaciones (Periodo), quitar la tarjeta interna y su contenido que aparece adentro de Consolidado General de Costos y Prestaciones (Periodo) (Completado)
- [x] **Tarea 16 (Frontend):** El boton Exportar CSV no genera el archivo CSV (Completado)
- [x] **Tarea 17 (Frontend):** Dado las restricciones de la tarea 11 y quiero suponer que por eso al tratar de generar un nueva planilla con el boton procesar y generar planilla del mes actual lanza un error que dice: Error al generar planilla
Error interno del servidor al generar la planilla. documenta el problema y solucion (Completado)

- [] **Tarea 18 (backend):** Mover el boton de inicio de sesion que esta en frontend/app-react/src/components/Navbar.jsx a la pestaña configuracion, en configuraciones quiero el siguiente orden modo oscuro,Lista de usuarios,Soporte,y Cerrar sesion, luego actuliza las reglas del rocedamos a corregir los scripts de prueba E2E de Playwright para alinearlos coon los selectores y la estructura del nuevo menú de usuario.

- [x] **Tarea 19 (Frontend y backend):** Quitar restricciones del backend y frontend temporalmente para probar la UI "Generar Planilla". **Importante:** Documentar con precision los cambios realizados en el codigo para revertirlos en produccion. (Completado)
  ### Cambios Temporales Realizados (Bypass)
  * **Archivo modificado (Backend):** `backend/controllers/v2_planillasController.js`
      * **Linea(s) comentada(s) / modificada(s):** 170 a 217
      * **Codigo original:**
        ```javascript
        // 1. Validar que no se generen planillas para meses pasados
        if (anioPlanilla < anioActual || (anioPlanilla === anioActual && mesPlanilla < mesActual)) {
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'PAST_MONTH_NOT_ALLOWED',
                message: 'No se pueden generar planillas para meses anteriores al mes actual.'
            });
        }

        // 2. Validar que no se intente generar para meses más allá del mes siguiente
        const mesesDiferencia = (anioPlanilla - anioActual) * 12 + (mesPlanilla - mesActual);
        if (mesesDiferencia > 1) {
            connection.release();
            return res.status(400).json({
                status: 'error',
                error: 'FUTURE_MONTH_NOT_ALLOWED',
                message: 'Solo se pueden generar planillas para el mes actual o el mes siguiente.'
            });
        }

        // 3. Si se intenta generar el mes siguiente, validar que el mes actual esté cerrado
        if (mesesDiferencia === 1) {
            const [planillasMesActual] = await connection.query(
                `SELECT estado FROM planillas 
                 WHERE YEAR(fecha_inicio) = ? AND MONTH(fecha_inicio) = ?`,
                [anioActual, mesActual]
            );

            if (planillasMesActual.length === 0) {
                connection.release();
                return res.status(400).json({
                    status: 'error',
                    error: 'CURRENT_MONTH_NOT_GENERATED',
                    message: 'No se puede generar la planilla del mes siguiente porque aún no se han generado las planillas del mes actual.'
                });
            }

            const algunaAbierta = planillasMesActual.some(p => p.estado !== 'CERRADA');
            if (algunaAbierta) {
                connection.release();
                return res.status(400).json({
                    status: 'error',
                    error: 'CURRENT_MONTH_NOT_CLOSED',
                    message: 'No se puede generar la planilla del mes siguiente hasta que todas las planillas del mes actual estén en estado CERRADA.'
                });
            }
        }
        ```
      * **Codigo temporal:**
        ```javascript
        /* BYPASS TEMPORAL DE RESTRICCIONES DE FECHA (TAREA 19 - SPRINT 5)
        // 1. Validar que no se generen planillas para meses pasados
        if (anioPlanilla < anioActual || (anioPlanilla === anioActual && mesPlanilla < mesActual)) { ... }
        // 2. Validar que no se intente generar para meses más allá del mes siguiente
        ...
        // 3. Si se intenta generar el mes siguiente, validar que el mes actual esté cerrado
        ...
        FIN DE BYPASS TEMPORAL */
        ```
  * **Archivo modificado (Frontend):** `frontend/app-react/src/components/V2_ContenedorPlanilla.jsx`
      * **Linea(s) comentada(s) / modificada(s):** Bloque de definicion de opciones de meses y select en render
      * **Codigo original:**
        ```javascript
        const [mesSeleccionado, setMesSeleccionado] = useState(opcionMesActual.valor);
        // ...
        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}>
            <option value={opcionMesActual.valor}>{opcionMesActual.label}</option>
            <option value={opcionMesSiguiente.valor}>{opcionMesSiguiente.label}</option>
        </select>
        ```
      * **Codigo temporal:**
        ```javascript
        const opcionesMesesBypass = nombresMeses.map((nombre, index) => ({
            valor: `${anioActual}-${String(index + 1).padStart(2, '0')}`,
            label: `${nombre} ${anioActual}`
        }));
        const [mesSeleccionado, setMesSeleccionado] = useState(opcionMesActual.valor);
        // ...
        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}>
            {opcionesMesesBypass.map(opcion => (
                <option key={opcion.valor} value={opcion.valor}>{opcion.label}</option>
            ))}
        </select>
        ```

  ### Plan de Retorno (Re-implementacion)
  - [ ] Volver a habilitar las restricciones de la Tarea 11 una vez finalizadas las pruebas de la UI.


- [x] **Tarea 20 (Frontend y backend):** Crea una UI para gestionar los cargos desde el Frontend, crea un componente para visualizar la tabla, otro componente para modificar los cargos en forma de formulario, y otro componente que cumpla la funcion de contenedor para que se visualice como frontend/app-react/src/components/V2_ContenedorEmpleado.jsx sigue las practicas de Documentacion/02-desarrollo-arquitectura/Buenas-Practicas-Backend.md y Documentacion/02-desarrollo-arquitectura/Buenas-Practicas-Backend.md, y al final documenta en Documentacion/02-desarrollo-arquitectura/API.md
- [x] **Tarea 21 (Frontend):** En la UI de generar planilla, en lugar de ingresar manualmente el monto a pagar por vacaciones, implementar un checklist para seleccionar a los empleados a quienes se les pagará las vacaciones, realizando el cálculo automáticamente en base a su salario base mensual y guardándolo en la base de datos a través del desglose de novedades. (Completado)

- [x] **Tarea 22 (Frontend y backend):** En Formato Planilla Consolidada el tiempo lo calcula con decimales, cambialo a numero entero ejemplo 14.08 salida 14 (Completado)

- [x] **Tarea 23 (Frontend y backend):** En Formato Planilla Consolidada el "Mes ingreso" lo quiero visualizar en numero, aparace el nombre del mes ejempo Enero salida quiero que se muestre 01 (Completado)
- [x] **Tarea 24 (Frontend y backend):** Quiero una UI para registrar los viaticos, Horas extras diurnas, Horas extras nocturnas, el nombre del componente lo dejo a tu criterio (Completado)
- [x] **Tarea 25 (Frontend):** En Formato Planilla Consolidada quita la conlumna INCAF (Completado)
- [x] **Tarea 26 (Frontend y backend):** En Formato Planilla Consolidada quiero saber por ISSS Empleado, AFP Empleado, ISR (Renta) Los numero salen en negativo documenta (Completado)
- [x] **Tarea 27 (Frontend y backend):** En Formato Planilla los numero y titulos de columna salen con color quitalo ya que difuculta su lectura, ponlo todo color negro,Solo utiliza color en la fila "TOTAL PLANILLA" un beneficio en color verde o rojo oscuro negrita para marcar una salida de flujo de nuestra empresa (Completado)

- [x] **Tarea 28 (Frontend y backend):** en "Generar Planilla" when se selecciona el mes enero aparace el checklist para la quincena veinticinco pero al dar generar no se visualiza osea el dato no se manda a la base de datos (Corregido y Completado)

- [x] **Tarea 29 (Frontend y backend):** en la UI generar planilla en las columnas Horas extras diurnas y Horas extras nocturnas, quiero que calculen automaticamente con en la columna "Vaciones a pagar" (Completado) 

- [x] **Tarea 30 (Frontend y backend):** Diseñar e implementar el nuevo módulo de "Programación de Vacaciones" conciliado. Esto incluye la creación de la columna `mes_vacaciones` en la tabla `empleados`, el desarrollo de una nueva UI para listar empleados aptos (antigüedad >= 1 año) y calendarizar el mes de goce (1-12), la eliminación de los checkboxes manuales de vacaciones de la UI de planillas, y la automatización del pago de vacaciones (1.30 * salario base / 2) al coincidir el mes de la planilla con el mes programado. (Completado) 