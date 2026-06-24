# Bitacora de Cambios - Proyecto RHU

## Registro de Correcciones

### 24 de Junio de 2026 - Correccion del calculo de Monto Cotizable (Exclusion de Viaticos)

#### Descripcion del Problema
Se identifico que en la tabla "Detalle de Empleados en Planilla" de la interfaz "Planillas de Sueldos", la columna **Monto Cotizable** mostraba un valor que incluia los viaticos, sumandolos de forma incorrecta a la base cotizable previsional de los empleados. 

#### Analisis Tecnico
* **Backend:** En el servicio de nomina (`v2_payrollService.js`), el valor de `salario_devengado` se compone sumando el sueldo base y otros conceptos devengados del periodo, incluyendo los viaticos. Para calcular las retenciones reales de ISSS y AFP, el backend restaba correctamente los viaticos (excluidos por ley al ser reintegros de gastos).
* **Frontend:** En el componente `V2_ContenedorPlanilla.jsx`, el frontend realizaba un calculo local para pintar el "Monto Cotizable" en la tabla:
  `Monto Cotizable = salarioDevengado - aguinaldo - quincenaVeinticinco`
  Al omitir la resta de los viaticos (que ya formaban parte de `salarioDevengado`), estos quedaban sumados incorrectamente a nivel de visualizacion en la UI.

#### Solucion Implementada
Se modifico el componente del frontend para restar explicitamente los viaticos al calcular el monto cotizable que se muestra en la tabla y los reportes de planillas.

La formula en el frontend ahora es equivalente a la del backend:
`Monto Cotizable = salarioDevengado - aguinaldo - quincenaVeinticinco - viaticos`

#### Archivos Modificados
* [V2_ContenedorPlanilla.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/contents/employees/V2_ContenedorPlanilla.jsx): Modificacion en la linea 510 para recuperar la variable `viaticos` de cada boleta (`b.viaticos`) y restarla al calcular `montoCotizable`.

---

## Analisis Comparativo: Sistema vs. Excel del Profesor

### Caso de Estudio: Carlos Eduardo Alvarado Perez (Diciembre)
* **Puesto:** Soporte de redes y HW (Administrativo)
* **Salario mensual base:** $700.00 USD
* **Antiguedad:** 6 anos (Fecha ingreso: 02/12/2019)
* **Viaticos del periodo:** $25.00 USD
* **Vacaciones del periodo:** $175.00 USD
* **Aguinaldo Legal de El Salvador:** $443.33 USD (19 dias de salario base por antiguedad entre 3 y 10 anos)

---

### Tabla Comparativa de Resultados

| Concepto | Calculo en Excel del Profesor | Calculo en el Sistema de Planillas (Real) |
| :--- | :--- | :--- |
| **Ingresos Totales (Devengado)** | **$1,600.00 USD** (Incluye salario base, viaticos, vacaciones, aguinaldo de ley de $443.33 y un complemento/bono de aguinaldo de $256.67) | **$1,343.33 USD** (Incluye salario base, viaticos, vacaciones y aguinaldo de ley de $443.33) |
| **Deduccion ISSS Empleado** | **$26.25 USD** (3.00% sobre base de $875.00) | **$26.25 USD** (3.00% sobre base de $875.00) |
| **Deduccion AFP Empleado** | **$63.44 USD** (7.25% sobre base de $875.00) | **$63.44 USD** (7.25% sobre base de $875.00) |
| **Retencion Renta (ISR)** | **$0.00 USD** (No se calcula en el Excel) | **$41.20 USD** (Retencion del Tramo II sobre base gravable del mes) |
| **Monto Neto a Depositar** | **$1,510.31 USD** | **$1,212.44 USD** |

---

### Explicacion de las Diferencias

#### 1. La Bonificacion de Aguinaldo de $256.67 USD
* **En el Excel del Profesor:** Para lograr que Carlos Eduardo Alvarado Perez reciba un mes completo de salario base como aguinaldo ($700.00 USD), el profesor suma el aguinaldo minimo de ley ($443.33 USD) y le anade una "Bonificacion de Aguinaldo" contractual de $256.67 USD ($443.33 + $256.67 = $700.00). Esta es una practica voluntaria de muchas empresas en El Salvador para beneficiar al empleado.
* **En el Sistema:** El sistema calcula estrictamente el aguinaldo obligatorio de ley segun el Articulo 198 del Codigo de Trabajo (19 dias de salario, equivalentes a $443.33 USD). No anade la bonificacion contractual de forma automatica a menos que el usuario la registre en novedades.

#### 2. La Retencion de Impuesto sobre la Renta (ISR) de $41.20 USD
* **En el Excel del Profesor:** El Excel simplifica el ejercicio omitiendo la retencion de Renta. En la academia es comun omitir la Renta para no complicar el analisis fiscal.
* **En el Sistema:** El sistema opera bajo un entorno de produccion real. En el mes de diciembre, el ingreso total de Carlos es alto debido a las vacaciones y al salario regular. Al proyectar sus ingresos anuales, estos superan el tramo exento y el sistema aplica la tabla de retencion quincenal/mensual del Ministerio de Hacienda de El Salvador sobre su renta gravada, resultando en un descuento legal obligatorio de $41.20 USD.

#### 3. Conciliacion Matematica Exacta
* Neto segun Excel del Profesor: **$1,510.31 USD**
* Restar la Bonificacion de Aguinaldo contractual (no presente en sistema): -$256.67 USD
* Restar el Impuesto sobre la Renta obligatorio (no calculado en el Excel): -$41.20 USD
* **Resultado Neto Final:** **$1,212.44 USD** (Monto exacto calculado por el Sistema).
