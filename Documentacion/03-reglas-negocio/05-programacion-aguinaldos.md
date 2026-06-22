# Reglas de Negocio: Programación y Calendarización de Aguinaldos

Este documento describe las reglas de negocio aplicadas al módulo de Programación de Aguinaldos de la empresa COMSERTEL.

---

## 1. Contexto Legal (Artículos 196 - 202 del Código de Trabajo)

El aguinaldo es una prestación económica obligatoria que todo empleador debe pagar a sus trabajadores en concepto de prima por cada año de trabajo continuo. La legislación salvadoreña establece los siguientes criterios:

*   **Época de Pago (Art. 200):** Por regla general, los aguinaldos deben pagarse en el lapso comprendido entre el 12 y el 20 de diciembre de cada año.
*   **Proporcionalidad (Art. 197):** Si el trabajador tiene menos de un año de servicio, tiene derecho a recibir un aguinaldo proporcional al tiempo laborado, calculado sobre la base de la escala de antigüedad correspondiente.

---

## 2. Flexibilización y Restricciones de Fecha

Para permitir un control administrativo total y dar flexibilidad ante distintos ciclos de nómina (quincenales o mensuales), el sistema incorpora un mecanismo de **Programación de Pago**:

1. **Fecha Programada de Pago:** El patrono define la fecha exacta en la que se le cancelará el aguinaldo al empleado. Esto se registra en la columna `fecha_aguinaldo` de la tabla `empleados`.
2. **Evaluación de Coincidencia con la Planilla:** Al procesar y generar una planilla, el motor de nómina del backend evalúa si la fecha programada de aguinaldo del empleado cae dentro del rango de vigencia de la planilla (`fecha_inicio <= fecha_aguinaldo <= fecha_fin`).
3. **Restricción de Rango de Fechas (20 de Octubre al 20 de Diciembre):**
   * Tanto en la asignación individual como en la asignación masiva del frontend, el sistema restringe de forma estricta las fechas que se pueden calendarizar.
   * Únicamente se permiten fechas comprendidas entre el **20 de octubre** y el **20 de diciembre** de cada año.
   * Cualquier intento de ingresar una fecha fuera de este intervalo será rechazado de inmediato por la interfaz con una alerta de advertencia, bloqueando el guardado en la base de datos.
4. **Cálculo Automático:** Si la fecha programada coincide con el rango del período (y cae dentro del intervalo permitido), el sistema calcula automáticamente el aguinaldo correspondiente.

Esto asegura que el aguinaldo se calcule en la planilla respectiva de fin de año, pero limitando el pago a la época legal autorizada.

---

## 3. Asignación Masiva y Edición en Lote (Mejora de Usabilidad)

Con el objetivo de agilizar la carga y calendarización en empresas con planillas numerosas, el módulo incorpora un mecanismo de **Asignación en Lote**:

*   **Selección Múltiple:** El administrador puede seleccionar uno, varios o todos los empleados del listado utilizando checkboxes de selección en la tabla.
*   **Fecha Común Permanente:** El Panel de Asignación Masiva cuenta con una entrada de fecha libre y habilitada constantemente. Esto permite definir la fecha de pago en cualquier momento (antes o después de seleccionar a los empleados) para facilitar el flujo de trabajo.
*   **Validación de Rango:** La fecha común seleccionada para el lote debe cumplir estrictamente con el rango del **20 de octubre al 20 de diciembre**.
*   **Procesamiento Concurrente Resiliente:** Al hacer clic en "Programar Seleccionados", el sistema realiza peticiones concurrentes seguras al backend para actualizar a todos los colaboradores elegidos. Si alguna petición individual falla, el proceso continúa con los demás y reporta con precisión cuántas actualizaciones fueron exitosas.

---

## 4. Integración en la Generación de Planilla (UX e Información al Usuario)

Para que el proceso de generación de planillas sea completamente transparente y predecible, la interfaz de **Generar Planilla** integra las siguientes funcionalidades:

1. **Extracción Automática de Fechas:** Al seleccionar el mes y período de la planilla, el sistema analiza dinámicamente los colaboradores activos y extrae la fecha de aguinaldo programada para cada uno de la base de datos.
2. **Cálculo de Aguinaldo Orientativo:** Si la fecha programada cae dentro del período seleccionado (`[fecha_inicio, fecha_fin]`), el sistema calcula en tiempo real el aguinaldo estimado utilizando el motor del frontend (idéntico al del backend) y lo muestra en color verde destacado (`DD/MM/YYYY ($XXX.XX)`), informando al usuario que esta prestación se incluirá automáticamente en la planilla consolidada.
3. **Indicador Fuera de Período:** Si el colaborador tiene una fecha de aguinaldo programada en otro mes o rango, la interfaz lo visualiza en gris como `Fuera de período (DD/MM/YYYY)`, ayudando a diagnosticar por qué no se computará en la planilla actual.
4. **Banner Informativo Proactivo:** Se despliega un banner de alerta en verde indicando la cantidad exacta de colaboradores con pago de aguinaldo programado para el período seleccionado.
