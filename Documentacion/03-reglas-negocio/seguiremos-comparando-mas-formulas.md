# Comparativa de Formulas: Excel vs Sistema

Este documento analiza y compara las formulas utilizadas en las plantillas de Excel frente a las implementaciones del sistema de planillas de COMSERTEL, evaluando su equivalencia matematica, diferencias de criterio y reglas de negocio.

---

## 1. Analisis de las Formulas de Excel (Profesor)

Las formulas proporcionadas por el profesor en Excel son:

*   **Horas Extras Diurnas (28 horas como ejemplo):**
    `=($Salario/30/8)*2*28`
*   **Horas Extras Nocturnas (15 horas como ejemplo):**
    `=($Salario/30/8)*2.5*15`

### Desglose de Terminos y Significado Legal:

1.  **`$Salario`**: Representa el salario base mensual del empleado.
2.  **`$Salario/30/8`**:
    *   `$Salario / 30`: Obtiene el salario ordinario equivalente a un dia de trabajo (antigüedad de mes comercial de 30 dias).
    *   `($Salario / 30) / 8`: Obtiene el valor economico de una hora ordinaria de trabajo diurno, basada en la jornada legal ordinaria de 8 horas diarias en El Salvador.
3.  **Factor multiplicador por recargo (`*2` y `*2.5`)**:
    *   **Horas Extras Diurnas (`* 2`)**: De acuerdo con el Articulo 169 del Codigo de Trabajo de El Salvador, las horas extraordinarias diurnas se pagan con un recargo del 100% sobre el salario basico ordinario (es decir, el pago es doble, por lo que se multiplica por 2).
    *   **Horas Extras Nocturnas (`* 2.5`)**: De acuerdo con el Articulo 168 del Codigo de Trabajo, el trabajo nocturno se remunera con un recargo del 25% sobre el trabajo diurno ordinario. A su vez, el Articulo 170 establece que las horas extras nocturnas se pagan con un recargo del 100% sobre la hora ordinaria nocturna. Matematica y legalmente el calculo es:
        $$\text{Valor Hora Extra Nocturna} = (\text{Valor Hora Ordinaria Diurna} \times 1.25) \times 2 = \text{Valor Hora Ordinaria Diurna} \times 2.5$$
        Por lo tanto, multiplicar directamente la hora ordinaria por 2.5 en Excel es equivalente a aplicar el 25% de recargo nocturno y despues duplicar el valor.
4.  **Multiplicador de cantidad de horas (`* 28` y `* 15`)**: Representa la cantidad exacta de horas extraordinarias devengadas en el periodo por el colaborador.

---

## 2. Equivalencia Matematica del Sistema de Planillas

El sistema realiza los mismos calculos utilizando formulas algebraicamente simplificadas en el codigo del frontend ([V2_ContenedorPlanilla.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/V2_ContenedorPlanilla.jsx)):

### A. Horas Extras Diurnas:
*   **Formula del Sistema:**
    $$\text{Monto HED} = \text{Cantidad de Horas} \times \frac{\text{Salario Base Mensual}}{120.0}$$
*   **Demostracion de Equivalencia:**
    $$\text{Formula del Profesor} = \left(\frac{\text{Salario}}{30 \times 8}\right) \times 2 \times \text{Horas} = \left(\frac{\text{Salario}}{240}\right) \times 2 \times \text{Horas} = \frac{\text{Salario} \times 2}{240} \times \text{Horas} = \frac{\text{Salario}}{120.0} \times \text{Horas}$$
    Ambas formulas son matematicamente identicas. La simplificacion a dividir entre 120.0 reduce las operaciones aritmeticas necesarias en el interprete de JavaScript.

### B. Horas Extras Nocturnas:
*   **Formula del Sistema:**
    $$\text{Monto HEN} = \text{Cantidad de Horas} \times \frac{\text{Salario Base Mensual}}{96.0}$$
*   **Demostracion de Equivalencia:**
    $$\text{Formula del Profesor} = \left(\frac{\text{Salario}}{30 \times 8}\right) \times 2.5 \times \text{Horas} = \left(\frac{\text{Salario}}{240}\right) \times \frac{5}{2} \times \text{Horas} = \frac{\text{Salario} \times 5}{480} \times \text{Horas} = \frac{\text{Salario}}{96.0} \times \text{Horas}$$
    Nuevamente, las formulas son matematicamente identicas. La simplificacion a dividir entre 96.0 optimiza el calculo directo en el sistema.

---

## 3. Diferencias Criticas de Operar en Excel vs en el Sistema

Aunque la logica matematica de base es identica, existen marcadas diferencias en el ambito operativo, contable e informatico al procesar la nomina:

### A. Redondeo y Precision Decimal (Discrepancia de Centavos)
*   **En Excel**: Si no se restringe la precision decimal, la formula de Excel calcula numeros con multiples decimales (ej. un valor de hora de $3.7916666...$). Al sumar multiples celdas sin redondear individualmente, la sumatoria final de la planilla puede arrastrar centavos de diferencia en comparacion con el dinero real desembolsado.
*   **En el Sistema**: El sistema redondea el monto de horas extras de cada boleta individual a dos decimales de forma explicita en la base del calculo (`Math.round(monto * 100) / 100`). Esto asegura que el total acumulado en el consolidado coincida exactamente con la suma visual de las boletas individuales, eliminando la discrepancia de centavos.

### B. Automatizacion y Minimizacion de Errores Operativos
*   **En Excel**: El operador debe copiar la formula, asegurarse de que las referencias a las celdas (absolutas y relativas como `$Salario` y `Horas`) sean correctas, y digitar manualmente. Un error de arrastre en la formula de Excel puede distorsionar el calculo de varios empleados sin que el usuario lo note de inmediato.
*   **En el Sistema**: El administrador unicamente introduce el numero de horas extras en un formulario web validado. La formula corre de manera interna e inalterable, mostrando ademas un calculo visual y reactivo en tiempo real debajo de la casilla para validar el dato ingresado antes de confirmar.

### C. Seguridad, Integridad y Auditoria de la Informacion
*   **En Excel**: Las celdas y los archivos de Excel se pueden modificar, sobreescribir o borrar facilmente por accidente. No hay un historial confiable de quien edito los montos o formulas.
*   **En el Sistema**: Los datos resultantes se persisten en una base de datos relacional MariaDB. Una vez que la planilla cambia al estado `CERRADA`, el sistema bloquea cualquier intento de edicion sobre los registros historicos, garantizando la inmutabilidad de la informacion y la consistencia ante auditorias de trabajo o fiscales.

### D. Integracion de Deducciones y Aportes Patronales de Ley
*   **En Excel**: Una vez calculadas las horas extras en columnas separadas, el operador debe sumarlas de manera manual a la base imponible del Seguro Social (ISSS), Prevision Social (AFP) e Impuesto sobre la Renta (ISR) para estimar los descuentos del empleado y los aportes patronales.
*   **En el Sistema**: El motor de nomina del backend ([v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js)) integra de manera automatica el monto de horas extras en el salario nominal devengado total y las bases cotizables. El sistema calcula y retiene de forma automatica el ISSS, AFP e ISR aplicando las tablas legales de tramos del Ministerio de Hacienda de manera inmediata.

---

## 4. Comparativa de las Formulas de Vacaciones (Monto y Bonificacion)

Analizaremos las formulas de Excel utilizadas para el calculo de vacaciones y la bonificacion de vacaciones en diciembre, en contraste con la implementacion del sistema de planillas.

### A. Formula de Excel para Monto de Vacaciones:
`=SI($H6=12,(($F6/2)*30%),0)`

Salario base / 2 *30

#### Desglose y Significado:
1. **Condicion `$H6=12`**: Evalua si el mes de ingreso del colaborador es diciembre (mes 12).
2. **Caso Verdadero `(($F6/2)*30%)`**:
   * `$F6`: Sueldo base mensual del colaborador.
   * `$F6 / 2`: Salario ordinario correspondiente a 15 dias de trabajo. De acuerdo con el Articulo 177 del Codigo de Trabajo de El Salvador, la vacacion anual completa es de 15 dias.
   * `* 30%` (o `* 0.30`): Aplica la prima o recargo de vacacion que manda la ley salvadoreña (30% sobre el salario de los 15 dias).
   * **Criterio**: Esta celda calcula unicamente el **monto de la prima del 30%** (equivalente a 4.5 dias de salario base) de forma fija para los colaboradores que ingresaron en diciembre.
3. **Caso Falso `0`**: Retorna 0 para los ingresos de otros meses.

---

### B. Formula de Excel para Bonificacion de Vacaciones:
`=SI($H6=12,SI((Y($I6>=2,$I6<5)),(($F6/2)*15%),SI($I6>=5,(($F6/2)*20%),0)),0)`

#### Desglose y Significado:
1. **Condicion Inicial `$H6=12`**: La bonificacion aplica exclusivamente si el mes de ingreso a la empresa fue diciembre.
2. **Evaluacion por Antiguedad (años en la celda `$I6`)**:
   * **Tramo A `Y($I6>=2,$I6<5)`**: Si el tiempo en la empresa en años es mayor o igual a 2 años y menor que 5 años, recibe una bonificacion del 15% sobre el salario de 15 dias: `(F6 / 2) * 15%`.
   * **Tramo B `$I6>=5`**: Si el tiempo en la empresa en años es mayor o igual a 5 años, recibe una bonificacion del 20% sobre el salario de 15 dias: `(F6 / 2) * 20%`.
   * **Otros casos**: Si tiene menos de 2 años de antiguedad, recibe `0`.
3. **Caso Falso General `0`**: Retorna 0 si el colaborador no ingreso en diciembre.

---

### C. Calculo en el Sistema (Backend - `v2_payrollService.js`):
El sistema gestiona el pago de vacaciones en el metodo `calcularVacaciones`:
* **Completa**: Si cumple el año continuo de servicio, se liquida el salario de 15 dias mas el 30% de recargo en una sola operacion:
  $$\text{Pago Vacacion} = \frac{\text{Salario Base}}{2.0} \times 1.30$$
* **Proporcional**: Si es un pago proporcional, se calcula segun los dias laborados en el año actual:
  $$\text{Vacacion Proporcional} = \text{Dias Proporcionales (Max 15)} \times \left(\frac{\text{Salario Base}}{30.0}\right) \times 1.30$$

---

### D. Diferencias Criticas y Discrepancias:

1. **Estructura del Desglose**:
   * **En Excel**: Se separa el calculo en dos columnas especificas en el Formato de Planilla Consolidada: una para el "Monto de vacaciones" (que equivale a la prima del 30% para los ingresos de diciembre) y otra para la "Bonificacion de vacaciones" (adicional del 15% o 20% segun la escala de años).
   * **En el Sistema**: El motor de nomina del backend consolida la vacacion completa (el salario de 15 dias base mas la prima del 30%) en un unico concepto unificado (`vacaciones`). No computa de manera nativa la bonificacion del 15% o 20% por antiguedad para los ingresos de diciembre en su calculo mensual ordinario.
2. **Dependencia de Precision Decimal en la Antiguedad (`I6`)**:
   * **En Excel**: La bonificacion depende de la columna `TIEMPO(AÑOS)`. Previamente, si se utilizaban enteros truncados (ej. 4.99 años se truncaba a 4), se podian generar diferencias. Con la correccion a dos decimales (`8.49`), el sistema ahora computa la antiguedad de forma precisa, permitiendo validar correctamente si el colaborador se encuentra en el rango de `[2.00, 5.00)` años para recibir el 15%, o si ha alcanzado exactamente los `5.00` años o mas para recibir el 20%.
3. **Politica Exclusiva de Diciembre**:
   * Ambas formulas de Excel estan condicionadas de manera estricta al mes de ingreso diciembre (`H6 = 12`). En el sistema, la liquidacion de vacaciones anuales se procesa de acuerdo a la fecha de contratacion real y aniversario de cada empleado, de manera distribuida durante todo el año ordinario.
