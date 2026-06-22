# Reglas de Negocio: Cálculo Provisional de Vacaciones y Bonificación de Vacaciones

Este documento detalla las reglas de negocio provisionales aplicadas para el cálculo del Monto de Vacaciones y la Bonificación de Vacaciones de los colaboradores del sistema.

> [!WARNING]
> **POLÍTICA PROVISIONAL DE ADMINISTRACIÓN**
> El cálculo detallado en este documento es de carácter **estrictamente provisional** y responde a las directrices de la plantilla de Excel provista por la administración para el cierre de período. Esta configuración se revertirá en el futuro para alinearse por completo con las disposiciones ordinarias del Código de Trabajo de El Salvador en lo referente a la prestación de vacaciones anuales completas.

---

## 1. Contexto Legal y Modificación Provisional

De acuerdo con el Artículo 177 del Código de Trabajo de El Salvador, las vacaciones anuales remuneradas constan de 15 días de descanso pagados con el salario ordinario correspondiente a dicho lapso más un recargo del 30% del mismo (lo que equivale a un factor total de `1.30` sobre el salario de la quincena).

No obstante, por instrucción de la administración de COMSERTEL, el sistema aplica las siguientes reglas de cálculo provisionales:

1. **Monto de Vacaciones General (Prima del 30%):** Para todos los colaboradores del sistema (independientemente de su mes de ingreso), la prestación de vacaciones básicas consistirá únicamente en el recargo del 30% del salario quincenal. No se computará el salario ordinario de 15 días.
2. **Bonificación de Vacaciones (Exclusivo Diciembre):** Para los colaboradores cuyo mes de ingreso a la empresa sea **Diciembre** (Mes 12), se adicionará de forma extraordinaria una bonificación por antigüedad en porcentaje (`15%` o `20%`) sobre el salario de 15 días.

---

## 2. Fórmulas de Cálculo Aplicadas

Las fórmulas de Excel provistas por la administración se han implementado directamente en el motor de nómina del backend y en el desglose de reporte consolidado en el frontend:

### A. Monto de Vacaciones (General)
Se aplica a todos los colaboradores elegibles para gozar de vacaciones en la planilla:
$$\text{Monto de Vacaciones} = \left(\frac{\text{Salario Base Mensual}}{2.0}\right) \times 0.30$$

*Esta fórmula equivale matemáticamente a 4.5 días de salario base.*

### B. Bonificación de Vacaciones (Exclusivo para Ingresos de Diciembre)
Aplica un porcentaje adicional sobre la base quincenal del empleado de acuerdo con su antigüedad en años al momento de corte de la planilla:

| Tramo de Antigüedad (Años) | Porcentaje de Bonificación | Fórmula Matemática |
| :--- | :--- | :--- |
| $\text{Antigüedad} < 2.00$ | $0\%$ | $\$0.00$ |
| $2.00 \le \text{Antigüedad} < 5.00$ | $15\%$ | $\left(\frac{\text{Salario Base Mensual}}{2.0}\right) \times 0.15$ |
| $\text{Antigüedad} \ge 5.00$ | $20\%$ | $\left(\frac{\text{Salario Base Mensual}}{2.0}\right) \times 0.20$ |

*Si el colaborador no ingresó en el mes de diciembre, el valor de esta bonificación será de $0.00.*

---

## 3. Totalización de la Prestación en Nómina

En el sistema, la prestación consolidada se persiste en el campo `vacaciones` de la tabla `boletas_pago` como la suma de ambos conceptos:

$$\text{Total Vacaciones Registradas} = \text{Monto de Vacaciones} + \text{Bonificación de Vacaciones}$$

Esto garantiza la consistencia del salario devengado para efectos contables y tributarios sin alterar la estructura física de la base de datos relacional establecida en [consolidado-base.md](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/consolidado-base.md).
