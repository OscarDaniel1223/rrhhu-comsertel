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
