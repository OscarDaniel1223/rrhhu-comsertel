# Informe de Cotejo y Analisis del Proyecto Comsertel RH

Este informe detalla el cotejo realizado entre los requerimientos descritos en [Puntos importantes.md](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/Otros/Puntos%20importantes.md) y [Retroalimentacion.md](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/Otros/Retroalimentacion.md) con el estado actual de la implementacion en el software y la documentacion del proyecto.

---

## 1. Analisis Comparativo (Cotejo)

### A. Leyes y Calculos de Nomina (Punto 4 de Puntos importantes.md)

*   **AFP (Cotizacion Previsional):**
    *   *Requisito:* Aplicar las tasas vigentes de ley en El Salvador (Empleado: 7.25%, Patrono: 8.75%) con el techo de cotizacion mensual vigente.
    *   *Estado:* **CUMPLIDO**. En [v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js#L78-L89) se aplica la tasa de 7.25% y 8.75% respectivamente con el techo de $7,028.29.
*   **ISSS (Seguro Social):**
    *   *Requisito:* Aplicar las tasas vigentes de ley en El Salvador (Empleado: 3.00%, Patrono: 7.50%) con el limite maximo (techo) de cotizacion de $1,000.00.
    *   *Estado:* **CUMPLIDO**. En [v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js#L98-L108) se aplica la tasa de 3.00% y 7.50% con el techo limite de $1,000.00.
*   **INCAF Patronal (Decreto N. 893):**
    *   *Requisito:* Aporte del 1% patronal (o 0.25% para el sector agropecuario) limitado a empresas con 10 o mas empleados.
    *   *Estado:* **CUMPLIDO**. Implementado en [v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js#L120-L130) y condicionado en [v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js#L385) a que existan 10 o mas empleados. Se mantiene compatibilidad en BD con el nombre anterior INSAFORP.
*   **Impuesto sobre la Renta (ISR):**
    *   *Requisito:* Tablas de retencion actualizadas en cuanto al salario exento ($550.00 mensual y $275.00 quincenal).
    *   *Estado:* **CUMPLIDO**. En [v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js#L140-L193) se utiliza la tabla de retencion mensual con Tramo I exento hasta $550.00 y la tabla quincenal exenta hasta $275.00, incluyendo la deduccion fija proporcional del Tramo II ($133.33 mensual / $66.67 quincenal) para colaboradores con ingresos anuales proyectados menores o iguales a $9,100.00.
*   **Salario Minimo:**
    *   *Requisito:* Los salarios de los empleados deben respetar el salario minimo de ley ($365.00 USD en el sector comercio, servicios e industria).
    *   *Estado:* **FALTA VALIDACION**. Ni el backend en [v2_cargosController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_cargosController.js) ni el frontend validan o restringen que el salario base configurado para un cargo sea menor a los $365.00 establecidos por ley.
*   **Aguinaldo de Ley:**
    *   *Requisito:* Ajuste a las escalas de ley del Codigo de Trabajo (15 dias de salario para 1 a <3 anos, 19 dias para 3 a <10 anos, y 21 dias para >=10 anos; proporcional para <1 ano). El aguinaldo debe estar exento de AFP, ISSS y renta (hasta $1,500.00).
    *   *Estado:* **CUMPLIDO PARCIALMENTE**. El calculo de escala y exenciones esta bien programado en el servicio. Sin embargo, hay un fallo critico de compatibilidad con las reformas recientes.
*   **Quincena Veinticinco (Decreto No. 499):**
    *   *Requisito:* Prestacion equivalente al 50% del salario para colaboradores que devenguen hasta $1,500.00. Completamente exenta de deducciones (ISSS, AFP, Renta) y embargos. Se debe pagar entre el 15 y el 25 de enero. Su ejecucion es voluntaria en el sector privado para el ano 2026 y obligatoria a partir de 2027.
    *   *Estado:* **CUMPLIDO PARCIALMENTE**. El backend y frontend procesan y muestran el rubro. No obstante, el parametro `esVoluntarioAceptado` (que determina si la empresa aplica el beneficio en 2026) se encuentra forzado (hardcoded) en `true` dentro del controlador [v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js#L302), impidiendo que el usuario lo configure en la interfaz al generar la planilla.

---

## 2. Discrepancias Identificadas frente a Reformas Recientes

### A. Fecha de Calculo del Pago de Aguinaldo
*   *El problema:* En [v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js#L313-L320), se restringe la generacion del aguinaldo exclusivamente a planillas que correspondan al mes de diciembre (mes 11 en Javascript):
    ```javascript
    const fechaCorte = new Date(fecha_fin + 'T00:00:00');
    if (fechaCorte.getMonth() === 11) { ... }
    ```
*   *La discrepancia:* De acuerdo con la reforma aprobada por la Asamblea Legislativa, el aguinaldo se puede pagar e iniciar su calculo entre el **20 de octubre y el 20 de diciembre**. El derecho al aguinaldo se acredita si el empleado esta activo al **20 de octubre**. La restriccion rigida a diciembre imposibilita que el sistema calcule el aguinaldo si el periodo de planilla se cierra en octubre o noviembre.

### B. Configuracion de la Quincena Veinticinco (Voluntariedad 2026)
*   *El problema:* El Decreto No. 499 establece que la Quincena 25 es de adopcion voluntaria en el sector privado para el ano 2026.
*   *La discrepancia:* En el controlador de planillas se evalua con un parametro fijo `true`, lo cual viola la libertad de la empresa privada de no aplicarlo en el periodo de transicion de 2026.

### C. Ausencia de Validaciones de Salario Minimo
*   *El problema:* El software permite definir salarios por debajo del minimo legal de $365.00 USD al crear o actualizar cargos en la base de datos.

### D. Falta de Documentacion (Puntos 2, 3, 5 y 8 de Retroalimentacion.md)
*   *El problema:* Falta documentar formalmente las definiciones de los conceptos, esquemas, formulas matematicas de retenciones, el numero de empleados, el organigrama y crear un Manual de Usuario o tutorial del software en la documentacion del proyecto.

---

## 3. Lista de Tareas Pendientes (Plan de Accion)

A continuacion, se presenta la lista de tareas organizadas para resolver las discrepancias y cumplir plenamente con las observaciones del docente Jacqueline Melendez:

### Fase 1: Correcciones en backend y Reglas de Negocio
- [ ] **Modificar la logica de fecha de calculo de Aguinaldo:**
  * Archivo a modificar: [v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js#L313-L323)
  * Descripcion: Reemplazar el condicional `fechaCorte.getMonth() === 11` por una validacion que verifique si la fecha final del periodo evaluado se encuentra dentro del rango legal permitido (entre el 20 de octubre y el 20 de diciembre de cada ano).
  * Archivo a modificar: [v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js#L227-L255)
  * Descripcion: Ajustar `calcularAguinaldo` para tomar en cuenta la fecha de acreditacion al 20 de octubre en el calculo de antiguedad ordinario.
- [ ] **Parametrizar la voluntariedad de la Quincena Veinticinco:**
  * Archivo a modificar: [v2_planillasController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_planillasController.js#L302)
  * Descripcion: Permitir que el valor `esVoluntarioAceptado` sea recibido desde el cuerpo de la peticion (`req.body`) al generar la planilla en lugar de estar hardcoded en `true`.
- [ ] **Agregar validacion de Salario Minimo en Cargos:**
  * Archivos a modificar: [v2_cargosController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_cargosController.js#L59) y [v2_cargosController.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/controllers/v2_cargosController.js#L90)
  * Descripcion: Agregar una validacion al crear y actualizar cargos para asegurar que el `salario_base` ingresado sea mayor o igual al salario minimo legal de $365.00 USD.

### Fase 2: Ajustes en Frontend
- [ ] **Incorporar control de Quincena Veinticinco en generacion de planilla:**
  * Archivo a modificar: [V2_ContenedorPlanilla.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/V2_ContenedorPlanilla.jsx)
  * Descripcion: Agregar un checkbox o switch en la interfaz de "Generar Planilla" (especialmente si el mes seleccionado es Enero de 2026) que permita al usuario decidir si la empresa aplicara voluntariamente el beneficio de la Quincena 25. Este valor debe enviarse a la API como `esVoluntarioAceptado`.
- [ ] **Agregar validacion visual de salario minimo en la creacion de cargos:**
  * Descripcion: Si existe un modulo/formulario para agregar cargos en el frontend, asegurar que se valide que el salario base no sea menor a $365.00.

### Fase 3: Documentacion y Entregables (Retroalimentacion.md)
- [ ] **Crear el Manual de Usuario y Guia del Sistema:**
  * Ubicacion: `Documentacion/04-guias-usuario/Manual-Usuario-Sistema.md`
  * Descripcion: Crear un tutorial paso a paso sobre el funcionamiento del software (creacion de empleados, gestion de ausencias, generacion y cierre de planillas, visualizacion de boletas).
- [ ] **Documentar el Proceso de Calculo y Formulas:**
  * Ubicacion: `Documentacion/03-reglas-negocio/Calculos-Nomina-Prestaciones.md`
  * Descripcion: Actualizar la seccion de formulas de calculo en el documento para que coincida exactamente con las formulas del Codigo de Trabajo y las reformas de ley recientes de El Salvador (exencion de renta de aguinaldo hasta $1500, quincena 25, tablas de renta 2025/2026 e INCAF).
- [ ] **Agregar organigrama e informacion de empleados:**
  * Ubicacion: `Documentacion/01-general/Estructura-Organizacional.md`
  * Descripcion: Agregar la informacion del numero de empleados, puestos de trabajo y organigrama funcional de la empresa COMSERTEL como parte del marco organizativo requerido.
