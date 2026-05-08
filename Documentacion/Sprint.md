# Planificación de Sprints: Migración Comsertel RH

Este documento organiza el trabajo para el grupo de 5 estudiantes. 
- **Desarrolladores (3):** Encargados de lógica, BD y UI.
- **Apoyo/QA (2):** Encargados de pruebas, documentación de API y validación de datos.

## Sprint 1: Cimentación y Estructura (1 Semana)
**Objetivo:** Tener la nueva base de datos lista y el primer CRUD funcional.

- **Tarea 1 (DB):** Montar MariaDB en Docker e importar el esquema `comsertel_rh`. (Dev 1)
- **Tarea 2 (Backend):** Crear controladores de `Departamentos` y `Cargos` usando `Async/Await`. (Dev 2)
- **Tarea 3 (Frontend):** Configurar la instancia de Axios y crear el primer layout limpio con Tailwind para el Dashboard. (Dev 3)
- **Tarea 4 (Apoyo):** Documentar los nuevos endpoints en un archivo `API.md` y preparar datos de prueba realistas. (Apoyo 1 y 2)

## Sprint 2: El Corazón del Sistema - Empleados (1 Semana)
**Objetivo:** Gestión completa de empleados vinculados a cargos y departamentos.

- **Tarea 1 (Backend):** CRUD de Empleados con `JOINs` para traer cargo y departamento en una sola consulta. (Dev 1)
- **Tarea 2 (Frontend):** Formulario dinámico de Registro de Empleados (Selects cargados desde la API). (Dev 2)
- **Tarea 3 (Frontend):** Tabla de empleados usando únicamente Tailwind CSS (Eliminar Bootstrap aquí). (Dev 3)
- **Tarea 4 (QA):** Validar que los DUI y NIT cumplan con el formato salvadoreño. (Apoyo 1 y 2)

## Sprint 3: Control de Tiempo y Ausencias (1 Semana)
**Objetivo:** Registrar incidencias que afectarán el pago.

- **Tarea 1 (Backend):** CRUD de `ausencias_incapacidades`. (Dev 1)
- **Tarea 2 (Frontend):** Vista de historial de ausencias por empleado. (Dev 2)
- **Tarea 3 (Lógica):** Crear la función de utilidad para calcular la Renta (Tablas de Hacienda). (Dev 3)
- **Tarea 4 (Docs):** Actualizar manuales de usuario para el registro de incapacidades ISSS. (Apoyo 1 y 2)

## Sprint 4: Gran Final - Planilla y Boletas (1 Semana)
**Objetivo:** Generación automática de pagos e impresión.

- **Tarea 1 (Backend):** Endpoint de "Generar Planilla" que ejecute todos los cálculos y guarde en `boletas_pago`. (Dev 1)
- **Tarea 2 (Frontend):** Vista de "Boleta de Pago" individual (Diseño para imprimir). (Dev 2)
- **Tarea 3 (Frontend):** Dashboard con resumen de costos patronales (ISSS/AFP patrono). (Dev 3)
- **Tarea 4 (QA/Entrega):** Pruebas de punta a punta y limpieza final de archivos innecesarios. (Todo el grupo)
