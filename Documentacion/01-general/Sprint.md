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
- [ ] **Tarea 5 (QA/Entrega):** Realizar pruebas de punta a punta (E2E), verificar la consistencia de los cálculos con datos reales y llevar a cabo la limpieza final de archivos y dependencias obsoletas. (Pendiente - Todo el grupo)
