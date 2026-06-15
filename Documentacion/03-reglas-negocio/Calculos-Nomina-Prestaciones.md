# Especificación de Cálculos de Nómina, Prestaciones y Aportes Patronales (v2)

Este documento detalla el análisis de compatibilidad, las discrepancias resueltas con respecto a [Investigacion-R.md](), y la implementación técnica de las tareas 4 y 5 del Sprint 3 ([Sprint.md]()) en el sistema de planillas de COMSERTEL.

---

## 1. Análisis de Discrepancias y Compatibilidad con Investigacion-R.md

Al contrastar la lógica de negocio previa con la investigación formal [Investigacion-R.md](), se identificaron y resolvieron tres discrepancias fundamentales:

1. **Denominación y Techo del Aporte Patronal de Capacitación:**
   * **Discrepancia:** En la base de datos se mantiene el campo de columna heredado `insaforp_patrono` en `boletas_pago`. Sin embargo, legislativamente, la entidad ha sido sustituida por el **INCAF** (Instituto Nacional de Capacitación y Formación) según el Decreto Legislativo N.° 893.
   * **Resolución:** A nivel de lógica de negocio y presentación del servicio, el cálculo se trata formalmente como **INCAF**. Se programó considerando que comparte la misma base cotizable y el techo máximo mensual de $1,000.00 establecido para el ISSS, cumpliendo de forma exacta con la investigación.

2. **Límite de Aplicación del Aporte INCAF:**
   * **Discrepancia:** La legislación salvadoreña estipula que solo los patronos del sector privado que posean una nómina de **diez o más trabajadores** (`Total_Empleados_Empresa >= 10`) están obligados a aportar el 1% para capacitación profesional. Nuestro cálculo inicial aplicaba la retención patronal de forma plana.
   * **Resolución:** Se condicionó la función de cálculo del aporte para que reciba la variable de la cantidad de empleados activos en la empresa. Si el total es menor a 10 trabajadores, el aporte se evalúa en $0.00.

3. **Exención Legal de Cotizaciones en Aguinaldos:**
   * **Discrepancia:** El pseudocódigo escolar de la investigación realizaba el cálculo de ISSS y AFP aplicando el porcentaje sobre el `Salario_Nominal_Devengado` total (el cual sumaba el Aguinaldo). En El Salvador, por ley (Art. 144 del Código de Trabajo y Ley del SAP), el aguinaldo ordinario está exento de cotizaciones de seguridad social (ISSS, AFP) y Renta.
   * **Resolución:** Para garantizar estricto cumplimiento legal, el servicio [v2_payrollService.js]() deduce el monto de aguinaldo del salario devengado para obtener la base cotizable de seguridad social (`salarioCotizableSeguridadSocial = salarioDevengado - aguinaldo`) antes de estimar el ISSS, la AFP y el INCAF. Lo mismo se aplica para el Impuesto sobre la Renta.

---

## 2. Implementación de Lógica y Fórmulas (Sprint 3)

### 2.1 Salario Nominal Devengado (Tarea 4)
Representa la retribución económica total del período evaluado:
$$\text{Salario Devengado} = \text{Salario Base Proporcional} + \text{Beneficios} + \text{Vacaciones} + \text{Aguinaldo} + \text{Quincena Veinticinco} - \text{Descuento Ausencias}$$
* **Descuento por Ausencia Injustificada:** Calculado sobre los días reales de traslape entre las ausencias del tipo `AUSENCIA_INJUSTIFICADA` aprobadas y el rango de fechas de la planilla. Su valor diario equivale a $\text{Salario Base} / 30.0$.
* Si el período de planilla es **QUINCENAL**, el salario base asignado para el cálculo es proporcional ($\text{Salario Base} / 2.0$).
* **Quincena Veinticinco (Decreto No. 499):** Ingreso extraordinario que incrementa el devengado del empleado, pero que cuenta con exenciones fiscales y de cotizaciones.

### 2.2 Deducciones y Aportes de Ley (Tarea 4)
* **AFP Empleado y Patrono:** Se cotiza el 7.25% (empleado) y 8.75% (patrono) sobre el salario cotizable de seguridad social, topado a un límite máximo mensual de $7,028.29. La base cotizable de seguridad social se obtiene restando el Aguinaldo ordinario y la Quincena Veinticinco del Salario Devengado.
* **ISSS Empleado y Patrono:** Se cotiza el 3.00% (empleado) y 7.50% (patrono) sobre el salario cotizable de seguridad social, topado a un límite máximo mensual de $1,000.00.
* **INCAF Patrono (Decreto N.° 893):** Se provisiona sobre el salario cotizable de seguridad social, topado a $1,000.00, únicamente si la empresa cuenta con 10 o más empleados.
  * Tasa General: 1.00%.
  * Sector Agropecuario: 0.25% sobre la planilla de salarios de trabajadores permanentes, y 0% (exento) para trabajadores temporales agrícolas.

### 2.3 Impuesto sobre la Renta (ISR) 2025 (Tarea 4)
Se aplica sobre la base gravada:
$$\text{Base Gravada} = \text{Salario Devengado} - \text{Aguinaldo} - \text{Quincena Veinticinco} - \text{AFP Empleado} - \text{ISSS Empleado}$$
* **Exención de la Quincena Veinticinco:** Este rubro califica como renta no gravable y se excluye de la base imponible de retención.
* **Deducción Especial del Tramo II:** Si el salario devengado anualizado del colaborador ($\text{Salario Devengado} \times \text{períodos anuales}$) es menor o igual a $9,100.00, se deduce de la base gravada el equivalente proporcional de los $1,600.00 anuales ($133.33 para períodos mensuales; $66.67 para quincenales).
* Una vez deducido, se evalúa en la tabla respectiva (Mensual o Quincenal) del Ministerio de Hacienda 2025 para obtener la retención.

### 2.4 Prestaciones Especiales de Ley (Tarea 5)
* **Aguinaldo (Art. 196-198 Código de Trabajo):**
  Calculado de manera proporcional o completa según la antigüedad del empleado en base a su fecha de ingreso:
  * Antigüedad menor a 1 año (proporcional):
    $$\text{Aguinaldo} = \left(\frac{\text{Días de Antigüedad}}{365}\right) \times 15 \times \text{Salario Diario}$$
  * Antigüedad de 1 a menos de 3 años: Equivalente a 15 días de salario base.
  * Antigüedad de 3 a menos de 10 años: Equivalente a 19 días de salario base.
  * Antigüedad de 10 o más años: Equivalente a 21 días de salario base.
* **Vacaciones (Art. 177 Código de Trabajo):**
  * Al completar un año continuo de servicio, equivale al pago de 15 días de salario base más una prima del 30% ($\text{Vacaciones} = \frac{\text{Salario Base}}{2} \times 1.30$).
  * En caso de retiros o liquidaciones proporcionales, se calcula a prorrata de los días laborados en el año:
    $$\text{Vacaciones Proporcionales} = \left(\frac{\text{Días Laborados}}{365} \times 15\right) \times \text{Salario Diario} \times 1.30$$
* **Quincena Veinticinco (Decreto No. 499):**
  * Aplicabilidad: Empleados con salario nominal mensual menor o igual a $1,500.00 USD.
  * Monto: 50% del salario nominal mensual del empleado al momento del pago.
  * Período de pago: Entre el 15 y el 25 de enero de cada año.
  * Vigencia en Sector Privado: Año 2026 voluntario (configurable por empresa); año 2027 en adelante obligatorio.
  * Vigencia en Sector Público/Municipal: Obligatorio desde el año 2026.
  * Finiquitos/Liquidaciones: En caso de despidos sin causa justa antes del 25 de enero en el año evaluado, se calcula la parte proporcional usando la regla matemática de prorrata anual (días trabajados o acumulados sobre 365 días).
  * Exención total: Libre de ISSS, AFP, Impuesto sobre la Renta y embargos judiciales. Tampoco forma parte de la base de cálculo para aguinaldos ni vacaciones.

---

## 3. Pruebas y Certificación de Resultados

Los algoritmos de cálculo fueron incorporados en el servicio principal [v2_payrollService.js]() y validados exhaustivamente mediante el script de pruebas unitarias [test_payroll.js](). 

Las pruebas certificaron:
1. Exactitud decimal en retenciones básicas de AFP, ISSS e ISR.
2. Aplicación correcta del beneficio de deducibilidad en el Tramo II para ingresos menores a $9,100.00 anuales.
3. Precisión calendárica en aguinaldos proporcionales (ej. $150.41 para 183 días reales trabajados con salario de $600.00).
4. Exención al 100% de cotizaciones previsionales, médicas e impositivas sobre el rubro de Aguinaldo.
5. Control dinámico de provisión patronal de INCAF en función de la cantidad de trabajadores en la nómina.

Todas las pruebas se completaron exitosamente con código de salida 0.
