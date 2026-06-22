# Detalles de Arquitectura: Implementación de Vacaciones y Bonificación Provisional

Este documento detalla la arquitectura y las modificaciones técnicas implementadas en el backend y frontend del sistema Comsertel para soportar la regla de negocio provisional para el cálculo general de vacaciones y la bonificación extraordinaria por antigüedad para los empleados ingresados en diciembre.

> [!WARNING]
> **POLÍTICA PROVISIONAL DE ADMINISTRACIÓN**
> Este comportamiento técnico es de carácter **estrictamente provisional** e implementa las directivas de las plantillas de Excel de administración. En fases futuras del proyecto se revertirá para mantener alineación total con la legislación ordinaria del Código de Trabajo de El Salvador.

---

## 1. Coexistencia en el Modelo de Datos

Para asegurar una integración limpia y consistente con el diseño de la base de datos relacional detallado en [consolidado-base.md](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/consolidado-base.md):

*   Se continúa utilizando el campo `vacaciones` en la tabla `boletas_pago` de la base de datos.
*   En lugar de crear nuevas columnas físicas, la prestación total se persiste de manera unificada como la suma de la vacación básica (`(salarioBase / 2.0) * 0.30`) y la bonificación por antigüedad en diciembre (si aplica).
*   Esto garantiza la integridad y exactitud aritmética en el cálculo del salario nominal devengado y en las deducciones y retenciones fiscales del motor de nómina.

---

## 2. Implementación en el Backend

### Archivo Modificado:
* [v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js)

### Lógica Técnica:
En el método estático `calcularVacaciones` se aplicó el siguiente flujo lógico:

1. **Cálculo Base de Vacaciones:** Se calcula la prima básica del 30% para todas las vacaciones completas: `montoVacaciones = (salarioBase / 2.0) * 0.30`.
2. **Evaluación de Excepción por Ingreso en Diciembre:** Se valida si el mes de ingreso del empleado corresponde a Diciembre (`getMonth() === 11`).
3. **Cálculo de Antigüedad y Bonificación:**
   * Si el mes de ingreso es diciembre y cumple con el año continuo, se calcula su antigüedad precisa en años.
   * Se evalúa la bonificación correspondiente:
     * Antigüedad $\ge 5.00$ años: `boniVacaciones = (salarioBase / 2.0) * 0.20`.
     * Antigüedad $\ge 2.00$ años y $< 5.00$ años: `boniVacaciones = (salarioBase / 2.0) * 0.15`.
     * De lo contrario: `0.00`.
4. **Suma y Retorno:** Se retorna la suma de ambos conceptos (`montoVacaciones + boniVacaciones`) redondeada a dos decimales. Para casos proporcionales, se aplica el factor `0.30` proporcionalmente a los días trabajados en el año actual.

---

## 3. Implementación en el Frontend

### Archivo Modificado:
* [V2_ContenedorPlanillaFormato.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/contents/employees/V2_ContenedorPlanillaFormato.jsx)

### Lógica Técnica:
Al procesar las boletas de pago para el reporte de formato extendido consolidado, se realiza un desglose dinámico:

1. Se obtiene el mes de ingreso del empleado (`mesIngresoNum`).
2. Se calcula el **Monto de vacaciones** de forma general como el 30% sobre el salario de 15 días: `(sueldoSalario / 2.0) * 0.30`.
3. **Si el mes de ingreso es diciembre:**
   * Se calcula la **Bonificación de vacaciones** aplicando el 15% o 20% sobre la base de 15 días según los años de antigüedad (`tiempoAnios`), o `0.0` si no cumple con la antigüedad mínima.
4. **Si el mes de ingreso NO es diciembre:**
   * La **Bonificación de vacaciones** se establece en `0.00`.
5. Se incluye una validación de tolerancia frente a montos proporcionales. Si existe una diferencia y la bonificación calculada es de `0.00`, el total acumulado de la boleta se asigna al concepto de **Monto de vacaciones** para evitar discrepancias en centavos.
