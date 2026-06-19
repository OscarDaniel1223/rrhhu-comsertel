# Cotejo de Implementacion de Vacaciones: Codigo de Trabajo vs Sistema

Este documento presenta la verificacion cruzada (cotejo) entre las disposiciones del Codigo de Trabajo de El Salvador (Arts. 177 al 189) y la implementacion logica de vacaciones desarrollada tanto en el backend como en el frontend en la version 2 (v2) del sistema de planillas de COMSERTEL.

---

## Tabla de Verificacion Cruzada

| Criterio Legal / Regla de Negocio | Disposicion del Codigo de Trabajo (Art.) | Implementacion en Backend | Implementacion en Frontend | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Elegibilidad por Antigüedad** | **Art. 177 / 179**: Mínimo 1 año continuo de servicios para gozar de vacaciones. | Se evalúa en base a la fecha de ingreso almacenada. `calcularVacaciones` asume la vacación ordinaria completa tras el aniversario. | En `V2_ContenedorProgramacionVacaciones.jsx` clasifica al personal en "Personal Apto" si `tiempoAnios >= 1.0` y en "Aún no elegibles" si es menor. | **Correcto** |
| **Cálculo Financiero de Ley** | **Art. 177**: Salario ordinario de 15 días calendario más un recargo o prima del 30% del mismo. | En `v2_payrollService.js`: `pagoVacacion = (salarioBase / 2.0) * 1.30`, redondeado a 2 decimales. | En `V2_ContenedorPlanilla.jsx` proyecta el mismo cálculo interactivo de `(salarioBase / 2) * 1.30` al inicializar las novedades. | **Correcto** |
| **Desglose de Conceptos en Reporte** | **Art. 177**: Separación visual del salario de vacación (100%) y la prima vacacional (30%). | Persiste el total cotizable en el campo `vacaciones` de la tabla `boletas_pago` en la base de datos. | En `V2_ContenedorPlanillaFormato.jsx` divide el total entre 1.30 para mostrar "Monto de vacaciones" (salario base de 15 días) y el 30% en "Bonificación de vacaciones". | **Correcto** |
| **Calendarización y Conciliación** | **Art. 182**: Señalamiento y calendarización de época del goce de mutuo acuerdo. | Almacena el mes programado de goce (1-12) en la columna `mes_vacaciones` de la tabla `empleados` a través de la ruta PUT en `v2_empleados.js`. | Permite seleccionar el mes en la nueva interfaz `V2_ContenedorProgramacionVacaciones.jsx` y guarda el cambio de inmediato en la base de datos. | **Correcto** |
| **Automatización del Pago** | **Art. 185**: Liquidación y pago obligatorio previo al inicio del goce. | En `v2_planillasController.js`: el motor compara `empleado.mes_vacaciones === mesPlanilla`. Si coincide, calcula y aplica la vacación automáticamente en la boleta. | En `V2_ContenedorPlanilla.jsx` elimina los checkboxes y carga los montos automáticamente para los programados del mes de la planilla. | **Correcto** |

---

## Diagnostico de Integridad y Consistencia

1. **Consistencia Aritmetica**: Tanto el backend (`v2_payrollService.js`) como el frontend (`V2_ContenedorPlanilla.jsx` y `V2_ContenedorProgramacionVacaciones.jsx`) utilizan el factor multiplicador `1.30` sobre la base quincenal del salario, previniendo discrepancias de centavos.
2. **Integridad de Datos**: La persistencia en la base de datos se realiza de forma centralizada en el backend. Si el operador del frontend enviara accidentalmente una novedad de vacaciones en un mes incorrecto, el controlador de planillas (`v2_planillasController.js`) recalculará el valor a `$0.00` de forma segura basándose en la coincidencia estricta de `mes_vacaciones === mesPlanilla`.
3. **Cargos y Formato**: El cálculo lee el salario base real del colaborador (`c.salario_base` mediante el `JOIN` en el controlador de planillas) evitando dependencias de campos manuales en el formulario, lo cual se alinea con la documentación fiscal y de auditoría interna de la empresa.
