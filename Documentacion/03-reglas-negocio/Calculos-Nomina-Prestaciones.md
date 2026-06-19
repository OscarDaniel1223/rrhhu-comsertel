# Especificacion de Calculos de Nomina, Prestaciones y Aportes Patronales (v2)

Este documento detalla el analisis de compatibilidad, las formulas matematicas de retencion, el proceso de calculo de prestaciones de ley de El Salvador, y la implementacion de reglas de negocio en el sistema de planillas de COMSERTEL.

---

## 1. Analisis de Discrepancias y Compatibilidad Legal

Para garantizar el cumplimiento de la legislacion salvadoreña vigente, el sistema de planillas de COMSERTEL ha sido refactorizado incorporando las siguientes normativas:

1. **Denominacion y Techo del Aporte Patronal de Capacitacion (INCAF):**
   * El Instituto Nacional de Capacitacion y Formacion (INCAF), que sustituyo al INSAFORP de acuerdo con el Decreto Legislativo N. 893, se calcula con una tasa patronal del 1.00% sobre la base cotizable del Seguro Social, sujeta a un limite maximo (techo) de cotizacion de $1,000.00 USD mensuales.
   * La obligacion patronal del aporte al INCAF aplica exclusivamente a empresas del sector privado que cuenten con una nomina de **diez o mas empleados** activos. Si la empresa cuenta con menos de 10 trabajadores, el aporte es del 0.00%.

2. **Deduccion Especial del Impuesto sobre la Renta (Tramo II):**
   * Se incorpora la deduccion fija proporcional del Tramo II para colaboradores cuyos ingresos anuales proyectados sean menores o iguales a $9,100.00 USD. Esta deduccion equivale a un descuento anual de $1,600.00 USD ($133.33 USD en planillas mensuales y $66.67 USD en planillas quincenales), el cual se resta de la base gravable antes de aplicar las tablas de retencion de Hacienda.

3. **Exenciones de Seguridad Social y Renta en Prestaciones Especiales:**
   * **Aguinaldo Ordinario de Ley:** Exento de cotizaciones previsionales (AFP), de salud (ISSS) y patronales (INCAF). Asimismo, por decreto legislativo, se encuentra exento del Impuesto sobre la Renta hasta el limite legal establecido (historicamente $1,500.00 USD).
   * **Quincena Veinticinco (Decreto N. 499):** Prestacion extraordinaria del 50% del salario base para empleados que devengan hasta $1,500.00 USD mensuales. Este rubro esta totalmente exento de retenciones de AFP, ISSS, Impuesto sobre la Renta y embargos judiciales.

---

## 2. Formulas y Proceso de Calculo de la Nomina

A continuacion se presentan las formulas aplicadas en el backend (`v2_payrollService.js`) para cada periodo de pago (Mensual o Quincenal).

### 2.1 Salario Nominal Devengado
Es la suma de todos los ingresos percibidos por el empleado en el periodo evaluado:

$$\text{Salario Devengado} = \text{Salario Base Proporcional} + \text{Beneficios} + \text{Vacaciones} + \text{Aguinaldo} + \text{Quincena Veinticinco} + \text{Horas Extras Diurnas} + \text{Horas Extras Nocturnas} + \text{Viaticos} - \text{Descuento por Ausencias}$$

Donde:
* **Salario Base Proporcional:** Equivale a $\text{Salario Base}$ en periodos mensuales, y a $\text{Salario Base} / 2.0$ en periodos quincenales.
* **Horas Extras Diurnas y Nocturnas:** Montos monetarios devengados por horas extraordinarias laboradas en el periodo.
* **Viaticos:** Monto asignado para el reembolso de gastos de viaje y operaciones.
* **Descuento por Ausencias:** Calculado sobre las ausencias del tipo `AUSENCIA_INJUSTIFICADA` aprobadas en el periodo. Cada dia de ausencia injustificada descuenta la parte proporcional diaria del salario base mensual:
$$\text{Descuento Diario} = \frac{\text{Salario Base Mensual}}{30.0}$$
$$\text{Descuento Total} = \text{Dias de Ausencia} \times \text{Descuento Diario}$$

### 2.2 Base Cotizable de Seguridad Social (Base ISSS / AFP / INCAF)
Las cotizaciones previsionales y de salud se calculan deduciendo los conceptos exentos (Aguinaldo, Quincena Veinticinco y Viaticos) del Salario Devengado total:

$$\text{Base Cotizable} = \text{Salario Devengado} - \text{Aguinaldo} - \text{Quincena Veinticinco} - \text{Viaticos}$$

*(Nota: Los viaticos representan reintegros de gastos y no constituyen salario previsional ni gravable de acuerdo con el Codigo de Trabajo. Por otro lado, los montos correspondientes a horas extras diurnas y nocturnas si son ingresos cotizables y gravables, por lo que no se deducen de la base cotizable).*

Esta base se encuentra sujeta a los techos de cotizacion mensuales legales:
* **Techo ISSS (Empleado y Patrono):** $1,000.00 USD mensuales ($500.00 USD quincenales).
* **Techo AFP (Empleado y Patrono):** $7,028.29 USD mensuales ($3,514.15 USD quincenales).
* **Techo INCAF (Patrono):** $1,000.00 USD mensuales ($500.00 USD quincenales).

### 2.3 Calculo de Retenciones del Empleado (Deducciones)
1. **AFP Empleado (7.25%):**
$$\text{Base AFP} = \min(\text{Base Cotizable}, \text{Techo AFP})$$
$$\text{AFP Empleado} = \text{Base AFP} \times 0.0725$$

2. **ISSS Empleado (3.00%):**
$$\text{Base ISSS} = \min(\text{Base Cotizable}, \text{Techo ISSS})$$
$$\text{ISSS Empleado} = \text{Base ISSS} \times 0.0300$$

### 2.4 Calculo de Impuesto sobre la Renta (ISR)
1. **Determinacion de la Base Gravada de Renta:**
La base sobre la cual se calcula el ISR se obtiene restando las deducciones de ley de seguridad social del empleado a la base de renta:
$$\text{Base Gravada Preliminar} = (\text{Salario Devengado} - \text{Aguinaldo} - \text{Quincena Veinticinco}) - \text{AFP Empleado} - \text{ISSS Empleado}$$

2. **Aplicacion de la Deduccion Especial del Tramo II:**
Se proyecta el ingreso anual para determinar si califica para la deduccion de los $1,600.00 USD anuales:
$$\text{Ingreso Anual Proyectado} = \text{Base Cotizable} \times \text{Periodos por Año}$$
Si $\text{Ingreso Anual Proyectado} \le 9100.00$ USD:
$$\text{Deduccion Proporcional} = \frac{1600.00}{\text{Periodos por Año}}$$
$$\text{Base Gravada Final} = \max(0, \text{Base Gravada Preliminar} - \text{Deduccion Proporcional})$$
En caso contrario:
$$\text{Base Gravada Final} = \text{Base Gravada Preliminar}$$

3. **Tablas de Retencion ISR (Ministerio de Hacienda de El Salvador):**

#### Tabla Mensual de Retencion
| Tramo | Desde (USD) | Hasta (USD) | Porcentaje | Cuota Fija (USD) | Sobre el Exceso de (USD) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **I (Exento)** | $0.01 | $550.00 | 0.00% | $0.00 | $0.00 |
| **II** | $550.01 | $895.24 | 10.00% | $17.67 | $550.00 |
| **III** | $895.25 | $2,038.10 | 20.00% | $60.00 | $895.24 |
| **IV** | $2,038.11 | En adelante | 30.00% | $288.57 | $2,038.10 |

*Formula Mensual:*
$$\text{ISR} = (\text{Base Gravada Final} - \text{Sobre el Exceso}) \times \text{Porcentaje} + \text{Cuota Fija}$$

#### Tabla Quincenal de Retencion
| Tramo | Desde (USD) | Hasta (USD) | Porcentaje | Cuota Fija (USD) | Sobre el Exceso de (USD) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **I (Exento)** | $0.01 | $275.00 | 0.00% | $0.00 | $0.00 |
| **II** | $275.01 | $447.62 | 10.00% | $8.83 | $275.00 |
| **III** | $447.63 | $1,019.05 | 20.00% | $30.00 | $447.62 |
| **IV** | $1,019.06 | En adelante | 30.00% | $144.28 | $1,019.05 |

*Formula Quincenal:*
$$\text{ISR} = (\text{Base Gravada Final} - \text{Sobre el Exceso}) \times \text{Porcentaje} + \text{Cuota Fija}$$

### 2.5 Calculo de Aportes y Costeo Patronal
1. **AFP Patronal (8.75%):**
$$\text{AFP Patronal} = \min(\text{Base Cotizable}, \text{Techo AFP}) \times 0.0875$$

2. **ISSS Patronal (7.50%):**
$$\text{ISSS Patronal} = \min(\text{Base Cotizable}, \text{Techo ISSS}) \times 0.0750$$

3. **INCAF Patronal (1.00% o 0.00%):**
Si el numero de empleados activos de la empresa es mayor o igual a 10:
$$\text{INCAF Patronal} = \min(\text{Base Cotizable}, \text{Techo ISSS}) \times 0.0100$$
Si el numero de empleados activos de la empresa es menor a 10:
$$\text{INCAF Patronal} = 0.00$$

### 2.6 Salario Neto Liquido
Es la cantidad neta en efectivo que recibe el empleado:

$$\text{Salario Neto} = \text{Salario Devengado} - \text{ISSS Empleado} - \text{AFP Empleado} - \text{ISR} - \text{Descuento por Ausencias}$$

*(Nota: Dado que el descuento por ausencias ya resta del Salario Devengado en la formula general, en la implementacion se deduce al estimar el devengado, evitando doble descuento).*

---

## 3. Calculo de Prestaciones Especiales y Anuales

El sistema computa de forma automatica y parametrizada las prestaciones adicionales reguladas por el Codigo de Trabajo y reformas recientes:

### 3.1 Aguinaldo de Ley (Art. 196-198 Codigo de Trabajo)
El calculo del aguinaldo se realiza anualmente. Segun la reforma legislativa, el calculo de antiguedad ordinaria se realiza tomando como fecha de acreditacion el **20 de octubre** de cada año. El pago debe efectuarse en el rango comprendido entre el **20 de octubre y el 20 de diciembre**.

Las escalas aplicadas para el calculo en base al salario base diario son:
* **Antigüedad menor a 1 año (proporcional):**
$$\text{Dias Proporcionales} = \frac{\text{Dias Transcurridos desde Ingreso}}{365.0} \times 15.0$$
$$\text{Aguinaldo} = \text{Dias Proporcionales} \times \left(\frac{\text{Salario Base}}{30.0}\right)$$
* **Antigüedad de 1 año a menos de 3 años:** Equivalente a 15 dias de salario base.
$$\text{Aguinaldo} = 15 \times \left(\frac{\text{Salario Base}}{30.0}\right)$$
* **Antigüedad de 3 años a menos de 10 años:** Equivalente a 19 dias de salario base.
$$\text{Aguinaldo} = 19 \times \left(\frac{\text{Salario Base}}{30.0}\right)$$
* **Antigüedad de 10 o mas años:** Equivalente a 21 dias de salario base.
$$\text{Aguinaldo} = 21 \times \left(\frac{\text{Salario Base}}{30.0}\right)$$

### 3.2 Vacaciones Ordinarias y Proporcionales (Art. 177 Codigo de Trabajo)
* Al cumplir un año continuo de servicio, el empleado tiene derecho a 15 dias de vacacion pagada mas un recargo del 30% de prima vacacional:
$$\text{Vacacion Ordinaria} = 15 \times \left(\frac{\text{Salario Base}}{30.0}\right) \times 1.30 = \frac{\text{Salario Base}}{2.0} \times 1.30$$
* En caso de finalizacion de contrato (finiquitos o despidos), se calcula la parte proporcional:
$$\text{Dias de Vacacion Proporcionales} = \frac{\text{Dias Laborados en el Año}}{365.0} \times 15.0$$
$$\text{Vacacion Proporcional} = \text{Dias de Vacacion Proporcionales} \times \left(\frac{\text{Salario Base}}{30.0}\right) \times 1.30$$

> [!NOTE]
> **Justificación Operativa e Integración en la Generación de Planillas:**
> Dado que la programación del descanso anual remunerado se coordina de manera individualizada a lo largo del año calendario entre el patrono y cada colaborador (según el Art. 177 del Código de Trabajo), el pago de la vacación no es recurrente ni global.
> 
> Para resolver esto, en la interfaz de usuario de **Generar Planilla** se ha integrado un mecanismo de selección mediante **Checklist**. Al seleccionar a los empleados que gozarán y liquidarán su vacación en el ciclo de nómina actual, el sistema calcula automáticamente la vacación ordinaria completa (`(salario_base / 2.0) * 1.30`) y lo registra como una novedad. Esto elimina la necesidad de ingresar manualmente el monto a pagar por el administrador, garantizando precisión aritmética legal y facilitando el almacenamiento directo en la base de datos en el campo `vacaciones` de la tabla `boletas_pago`.

### 3.3 Quincena Veinticinco (Decreto N. 499)
* **Requisito de Aplicacion:** El salario base mensual del empleado debe ser menor o igual a $1,500.00 USD.
* **Monto:** Equivalente al 50% del salario base mensual del colaborador.
* **Periodo de Pago Ordinario:** Se paga anualmente entre el 15 y el 25 de enero.
* **Vigencia en Sector Privado:** Año 2026 de adopcion voluntaria por la empresa (configurable mediante switch en frontend). Año 2027 en adelante de caracter obligatorio.
* **Calculo Proporcional en Liquidaciones (Finiquito):** Si ocurre un despido injustificado antes del 25 de enero, se paga la proporcion acumulada de los dias trabajados con base al monto total de la prestacion.

### 3.4 Horas Extras Diurnas y Nocturnas (Art. 169 y 170 Codigo de Trabajo)
El calculo de la remuneracion por jornada extraordinaria se computa en base al valor de la hora ordinaria de trabajo diurno del empleado, adicionando los recargos legales correspondientes:
* **Valor de la Hora Ordinaria Diurna**: Obtenida dividiendo el salario base mensual entre 30 dias y luego entre las 8 horas de la jornada legal:
  $$\text{Valor Hora Ordinaria} = \frac{\text{Salario Base Mensual}}{240.0}$$
* **Horas Extras Diurnas (HED)**: De acuerdo al Art. 169, se pagan con un recargo del 100% (pago doble):
  $$\text{Valor Hora Extra Diurna} = \text{Valor Hora Ordinaria} \times 2 = \frac{\text{Salario Base Mensual}}{120.0}$$
  $$\text{Monto HED} = \text{Cantidad de Horas Extras Diurnas} \times \frac{\text{Salario Base Mensual}}{120.0}$$
* **Horas Extras Nocturnas (HEN)**: De acuerdo al Art. 168 y 170, la jornada nocturna ordinaria tiene un recargo del 25% sobre la diurna ordinaria, y las horas extraordinarias nocturnas se pagan con un recargo del 100% sobre el valor de la hora nocturna ordinaria (es decir, pago doble con el recargo incluido):
  $$\text{Valor Hora Ordinaria Nocturna} = \text{Valor Hora Ordinaria} \times 1.25 = \frac{\text{Salario Base Mensual}}{240.0} \times 1.25$$
  $$\text{Valor Hora Extra Nocturna} = \text{Valor Hora Ordinaria Nocturna} \times 2 = \frac{\text{Salario Base Mensual}}{96.0}$$
  $$\text{Monto HEN} = \text{Cantidad de Horas Extras Nocturnas} \times \frac{\text{Salario Base Mensual}}{96.0}$$

> [!NOTE]
> **Calculo Automatico y Entrada de Datos en el Frontend:**
> A partir de la implementacion del Sprint 5 (Tarea 29), el administrador ya no digita montos monetarios en dolares para las horas extras. En su lugar, el sistema solicita la **cantidad de horas** trabajadas.
> Al introducir las horas en los campos correspondientes del formulario de novedades, la interfaz de usuario estima y despliega de manera interactiva el costo financiero en dolares en tiempo real. Al procesar el formulario, el sistema realiza la conversion aritmetica exacta y envia los montos calculados al backend de manera transparente para persistirlos.

---

## 4. Ejemplos Practicos de Calculo

### Caso A: Vendedor Toque en Frio (Planilla Quincenal Ordinaria - 15 dias)
* **Datos del Empleado:**
  * Salario Base Mensual: $365.00 USD
  * Salario Quincenal Base: $182.50 USD
  * Total Empleados Empresa: 14 (Aplica INCAF)
  * Ausencias: 0
  * Beneficios: $0.00
  * Aguinaldo / Quincena 25: $0.00

* **Calculo de Deducciones:**
  * **Base Cotizable Quincenal:** $182.50 USD
  * **AFP Empleado (7.25%):** $182.50 \times 0.0725 = $13.23 USD
  * **ISSS Empleado (3.00%):** $182.50 \times 0.0300 = $5.48 USD
  * **Base Gravada de Renta (Preliminar):** $182.50 - $13.23 - $5.48 = $163.79 USD
  * **Deduccion Especial Tramo II:**
    * Ingreso anual estimado: $182.50 \times 24 = $4,380.00 USD (Menor a $9,100.00 USD)
    * Deduccion proporcional quincenal: $1,600.00 / 24 = $66.67 USD
    * Base Gravada Final: $163.79 - $66.67 = $97.12 USD
  * **ISR (Renta):** Como la base gravada final de $97.12 USD es menor al Tramo I de la tabla quincenal ($275.00 USD), el ISR retenido es de $0.00 USD.

* **Resultado Neto:**
  * **Salario Neto Liquido:** $182.50 - $13.23 - $5.48 - $0.00 = $163.79 USD

* **Cargas Patronales:**
  * **AFP Patronal (8.75%):** $182.50 \times 0.0875 = $15.97 USD
  * **ISSS Patronal (7.50%):** $182.50 \times 0.0750 = $13.69 USD
  * **INCAF Patronal (1.00%):** $182.50 \times 0.0100 = $1.83 USD
  * **Total Cargas Patronales:** $31.49 USD

### Caso B: Jefe Operativo (Planilla Mensual Ordinaria - Diciembre con Aguinaldo)
* **Datos del Empleado:**
  * Salario Base Mensual: $800.00 USD
  * Antigüedad: 2 años completos
  * Total Empleados Empresa: 14 (Aplica INCAF)
  * Ausencias: 0
  * Beneficios: $0.00
  * Aguinaldo: 15 dias de salario base por ley = $400.00 USD (Exento de AFP/ISSS/ISR)

* **Calculo de Ingresos:**
  * **Salario Devengado:** $800.00 + $400.00 (Aguinaldo) = $1,200.00 USD

* **Calculo de Deducciones:**
  * **Base Cotizable Seguridad Social:** $1,200.00 - $400.00 = $800.00 USD
  * **AFP Empleado (7.25%):** $800.00 \times 0.0725 = $58.00 USD
  * **ISSS Empleado (3.00%):** $800.00 \times 0.0300 = $24.00 USD
  * **Base Gravada de Renta (Preliminar):** $800.00 - $58.00 - $24.00 = $718.00 USD
  * **Deduccion Especial Tramo II:**
    * Ingreso anual estimado: $800.00 \times 12 = $9,600.00 USD (Mayor a $9,100.00 USD)
    * No aplica la deduccion especial de los $1,600.00 USD.
    * Base Gravada Final: $718.00 USD
  * **ISR (Renta) - Tabla Mensual (Tramo II: $550.01 a $895.24):**
    * Exceso a aplicar: $718.00 - $550.00 = $168.00 USD
    * Porcentaje: 10%
    * Cuota Fija: $17.67 USD
    * ISR Retenido: $(168.00 \times 0.10) + 17.67 = $34.47 USD

* **Resultado Neto:**
  * **Salario Neto Liquido:** $1,200.00 - $58.00 - $24.00 - $34.47 = $1,083.53 USD (Incluye el aguinaldo completo libre de descuentos).

* **Cargas Patronales:**
  * **AFP Patronal (8.75%):** $800.00 \times 0.0875 = $70.00 USD
  * **ISSS Patronal (7.50%):** $800.00 \times 0.0750 = $60.00 USD
  * **INCAF Patronal (1.00%):** $800.00 \times 0.0100 = $8.00 USD
  * **Total Cargas Patronales:** $138.00 USD
