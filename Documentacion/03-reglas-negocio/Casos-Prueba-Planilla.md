# Guia de Casos de Prueba para Calculo de Planillas (El Salvador)

Este documento detalla los escenarios de prueba del motor de calculo de nomina para verificar el cumplimiento de las retenciones de ley, beneficios extraordinarios y decretos especiales (Decretos N.° 499 y 893).

Para facilitar las pruebas, se puede ejecutar el script de distribucion:
```bash
node actualizar_salarios.js distribuir
```
El cual asigna a los diferentes cargos los salarios especificos detallados en los siguientes casos.

---

## Caso 1: Empleado con Antigüedad Menor a 1 Año (Calculo Proporcional)
* **Objetivo:** Verificar la proporcionalidad en el calculo de aguinaldo y vacaciones.
* **Datos de Entrada:**
  * **Salario Base:** $365.00
  * **Fecha de Ingreso:** 6 meses antes de la fecha de corte (ej. 182 dias de antiguedad).
  * **Periodo de Planilla:** Diciembre (periodo de aguinaldo) o con vacaciones programadas en novedades.
* **Formulas:**
  * **Aguinaldo Proporcional:** `(dias_antiguedad / 365.0) * 15 * (salario_base / 30.0)`
  * **Vacacion Proporcional:** `(dias_trabajados_en_anio / 365.0) * 15 * (salario_base / 30.0) * 1.30`
* **Resultados Esperados (para 182 dias de antiguedad):**
  * **Aguinaldo:** `(182 / 365.0) * 15 * 12.17 = $91.00`
  * **Vacacion:** `(182 / 365.0) * 15 * 12.17 * 1.30 = $118.30` (Monto Base: $91.00, Prima 30%: $27.30)
  
---

## Caso 2: Empleado con Salario Mayor a $1,000.00 (Exceso de Techo ISSS)
* **Objetivo:** Confirmar que la retencion y aporte patronal del ISSS no superen el limite maximo mensual de $1,000.00.
* **Datos de Entrada:**
  * **Salario Base:** $1,200.00 (Mensual)
  * **Novedades:** Ninguna
* **Formulas:**
  * **ISSS Empleado (Techo $1,000):** `Min(salario, 1000) * 3% = $30.00` (En lugar de $36.00)
  * **ISSS Patronal (Techo $1,000):** `Min(salario, 1000) * 7.5% = $75.00` (En lugar de $90.00)
  * **AFP Empleado:** `1200 * 7.25% = $87.00`
  * **Base Gravable ISR:** `1200 - 30.00 (ISSS) - 87.00 (AFP) = $1,083.00`
  * **ISR (Tramo III Mensual):** `((1083.00 - 895.24) * 20%) + 60.00 = $97.55`
* **Resultados Esperados:**
  * **ISSS Empleado:** $30.00 | **AFP Empleado:** $87.00 | **ISR:** $97.55
  * **Neto a Recibir:** `1200 - 30.00 - 87.00 - 97.55 = $985.45`
  * **ISSS Patronal:** $75.00 | **AFP Patronal:** $105.00 | **INCAF (1%):** $10.00 (Techo $1,000.00)

---

## Caso 3: Empleado con Salario <= $1,500.00 (Aplica Quincena Veinticinco)
* **Objetivo:** Verificar la aplicacion del beneficio extraordinario Quincena Veinticinco en Enero 2026.
* **Datos de Entrada:**
  * **Salario Base:** $1,200.00
  * **Periodo de Planilla:** Del 15 al 25 de Enero 2026
* **Formulas:**
  * **Monto Quincena Veinticinco (50% Salario Nominal):** `1200 * 0.50 = $600.00`
  * **Exencion:** Este monto no esta sujeto a retenciones de ISSS, AFP ni ISR.
* **Resultados Esperados:**
  * **Quincena Veinticinco:** $600.00 (sumado directamente al Neto sin aplicar deducciones de ley sobre este valor).
  * **Neto Incrementado:** Neto regular del mes + $600.00.

---

## Caso 4: Empleado con Salario > $1,500.00 (Exento de Quincena Veinticinco)
* **Objetivo:** Comprobar que los empleados con salario nominal superior a $1,500.00 no reciban la Quincena Veinticinco.
* **Datos de Entrada:**
  * **Salario Base:** $1,600.00
  * **Periodo de Planilla:** Del 15 al 25 de Enero 2026
* **Resultados Esperados:**
  * **Quincena Veinticinco:** $0.00

---

## Caso 5: Empleado que Excede el Techo de AFP ($7,028.29)
* **Objetivo:** Validar el limite maximo de cotizacion para AFP en salarios elevados.
* **Datos de Entrada:**
  * **Salario Base:** $7,500.00 (Mensual)
* **Formulas:**
  * **AFP Empleado (Techo $7,028.29):** `7028.29 * 7.25% = $509.55` (En lugar de $543.75)
  * **AFP Patronal (Techo $7,028.29):** `7028.29 * 8.75% = $614.98`
* **Resultados Esperados:**
  * **AFP Empleado:** $509.55
  * **AFP Patronal:** $614.98

---

## Caso 6: Empleado con Ausencias Injustificadas Aprobadas (Descuentos)
* **Objetivo:** Verificar que el sistema descuente los dias no laborados y recalcule las retenciones sobre la base reducida.
* **Datos de Entrada:**
  * **Salario Base:** $900.00 (Mensual)
  * **Ausencias:** 3 dias de ausencia injustificada aprobada en el periodo de planilla.
* **Formulas:**
  * **Descuento por Dia:** `900.00 / 30.0 = $30.00` por dia.
  * **Descuento Total:** `3 * 30.00 = $90.00`
  * **Salario Devengado Reducido:** `900.00 - 90.00 = $810.00`
  * **ISSS Empleado (sobre 810.00):** `810.00 * 3% = $24.30`
  * **AFP Empleado (sobre 810.00):** `810.00 * 7.25% = $58.73`
  * **Base Renta:** `810.00 - 24.30 - 58.73 = $726.97`
  * **ISR (Tramo II Mensual):** `((726.97 - 550.00) * 10%) + 17.67 = $35.37`
* **Resultados Esperados:**
  * **Descuento Ausencias:** $90.00
  * **ISSS Empleado:** $24.30 | **AFP Empleado:** $58.73 | **ISR:** $35.37
  * **Neto a Depositar:** `810.00 - 24.30 - 58.73 - 35.37 = $691.60`

---

## Caso 7: Empleado con Salario Minimo y Regla de Tramo II de ISR
* **Objetivo:** Confirmar la aplicacion de la regla especial del Tramo II para ingresos anuales <= $9,100.00 (deduccion anual fija de $1,600.00 proporcional por periodo).
* **Datos de Entrada:**
  * **Salario Base:** $365.00 (Mensual)
* **Formulas:**
  * **Ingreso Anual Estimado:** `365.00 * 12 = $4,380.00` (Menor a $9,100.00, aplica deduccion de Tramo II).
  * **Deduccion Proporcional Mensual:** `1600.00 / 12 = $133.33`
  * **Base Gravable Regular:** `365.00 - 10.95 (ISSS 3%) - 26.46 (AFP 7.25%) = $327.59`
  * **Base Gravable con Deduccion Especial:** `Max(0, 327.59 - 133.33) = $194.26`
  * **ISR:** Como $194.26 es menor a $550.00 (Tramo I), el impuesto es $0.00.
* **Resultados Esperados:**
  * **ISSS Empleado:** $10.95 | **AFP Empleado:** $26.46 | **ISR:** $0.00
  * **Neto a Depositar:** $327.59
