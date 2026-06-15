## **2.1 ¿Qué es una planilla de pago?**

Según los teóricos Gary Dessler y Ricardo Varela en su obra Administración de Recursos Humanos (2011), la planilla o nómina representa el registro financiero fundamental donde una organización detalla los salarios, bonificaciones, y deducciones de ley de sus empleados. Constituye el documento contable, legal e histórico que certifica el cumplimiento de la obligación principal del empleador hacia su fuerza laboral, demostrando la retribución económica a cambio del trabajo efectuado y acreditando las retenciones que impone el Estado.

## **2.2 ¿Qué es el proceso de administración de planilla?**

El proceso de administración de planillas consiste en un flujo metódico de operaciones contables y de recursos humanos destinadas a asegurar el pago correcto y puntual a los empleados. Este proceso incluye el registro de la asistencia, el cálculo de las horas trabajadas frente a los parámetros legales, la aplicación de deducciones por beneficios o faltas, el descuento riguroso de impuestos y aportes de seguridad social, y concluye con la emisión de los pagos y las respectivas boletas o comprobantes. En sistemas eficientes, este proceso está automatizado para minimizar errores y asegurar el cumplimiento de plazos legales (Dessler y Varela, 2011).

## **2.3 ¿Qué información es necesaria para el desarrollo del proceso de administración de planillas?**

Para ejecutar el costeo exacto de la nómina y garantizar el procesamiento sin errores, un sistema informático requiere gestionar los siguientes datos críticos de forma interrelacionada:

* **Datos de identificación del empleado:** Nombres, apellidos, Documento Único de Identidad (DUI) y Número de Identificación Tributaria (NIT).  
* **Parámetros contractuales:** Cargo ocupado, departamento al que pertenece, salario base devengado y periodicidad de pago.  
* **Registro de asistencia y eventualidades:** Días efectivos laborados, horas extras (si las hubiere), incapacidades certificadas (como las del ISSS) y ausencias injustificadas.  
* **Constantes legales:** Constantes legales: Tablas vigentes de retención de la renta y los porcentajes obligatorios del régimen de seguridad social y de pensiones.los porcentajes obligatorios del régimen de seguridad social, pensiones y aportes de capacitación profesional (INCAF).


## **2.4 Descuentos de ley en El Salvador aplicados al salario gravado**

El marco legal salvadoreño impone retenciones específicas sobre el salario nominal del trabajador y obligaciones prestacionales para el patrono.

### **2.4.1 Seguridad social**

Según el Reglamento para la Aplicación del Régimen del Seguro Social (Decreto Ejecutivo No. 37), el sistema brinda cobertura de salud y riesgos comunes. La legislación determina:

* **Retención al empleado:** Se deduce un 3% sobre el salario devengado.  
* **Aporte Patronal:** La empresa debe aportar un 7.5% sobre el salario del trabajador. Es importante destacar que ambos porcentajes se aplican hasta el techo máximo cotizable establecido por el ISSS (actualmente de $1,000.00).

### **2.4.2 Pensión**

Con base en la Ley del Sistema de Ahorro para Pensiones (SAP) (Decreto No. 927), la seguridad económica para la vejez, invalidez y supervivencia se financia mediante cotizaciones al sistema.

* **Retención al empleado:** El trabajador contribuye con el 7.25% de su salario mensual base.  
* **Aporte patronal:** El empleador asume un aporte del 8.75% sobre el mismo salario base. Estos cálculos garantizan el fondeo de las cuentas individuales administradas por las AFP.

### **2.4.3 Capacitación y Formación Profesional (INCAF)**

Con base en la Ley del Instituto Nacional de Capacitación y Formación (INCAF) (Decreto Legislativo N.° 893), los empleadores del sector privado e Instituciones Oficiales Autónomas que posean una nómina de diez o más trabajadores están obligados a aportar sobre el monto total mensual de las planillas de salarios.

Es imperativo destacar que el módulo de planillas debe calcular esta provisión como un aporte netamente patronal, sin representar ninguna deducción al salario bruto del empleado. Asimismo, el sistema debe programarse considerando que este cálculo comparte la misma base y techo máximo cotizable de $1,000.00 establecido para las cotizaciones del ISSS.

* **Tasa General:** 1.00% sobre la base cotizable.
* **Excepción Sector Agropecuario:** Tasa del 0.25% calculada sobre la planilla de salarios de trabajadores permanentes (los trabajadores temporales agrícolas están exentos de esta aportación).

> [!NOTE]
> **Nota de actualización:** Se verificó que este aporte patronal de INCAF se aplica únicamente a las empresas que cuentan con **diez o más trabajadores** (`Total_Empleados_Empresa >= 10`). Para empresas con menos de 10 trabajadores, el aporte se establece en $0.00.


### **2.4.4 Renta**

La retención del Impuesto sobre la Renta (ISR) constituye un tributo progresivo que no se calcula sobre el salario nominal, sino sobre el salario gravado. El salario gravado se obtiene restando las retenciones obligatorias de ISSS y AFP al salario gravado libre de aguinaldos del trabajador.

> [!NOTE]
> **Nota de actualización:** Por disposición legal en El Salvador, el aguinaldo ordinario de ley está exento del Impuesto sobre la Renta. Para calcular el salario gravado de renta, se debe restar el aguinaldo ordinario del salario devengado antes de restar las cotizaciones obligatorias de ISSS y AFP correspondientes al salario ordinario.

Una vez determinado el salario gravado, el sistema debe liquidar el impuesto utilizando las Tablas de Retención del Ministerio de Hacienda. Según lo establecido en el Decreto Ejecutivo No. 95 (2015) y sus recientes modificaciones introducidas por el Decreto Ejecutivo No. 10 de fecha 30 de abril de 2025 (DGII-DC-2025-01), la tabla de cálculo mensual se estructura en cuatro tramos, habiéndose ampliado la base exenta hasta los $550.00:2.4.4 Semana laboral, jornada ordinaria y horas extras  
De acuerdo con el Código de Trabajo de la República de El Salvador, el cálculo exacto del salario devengado requiere la parametrización de las jornadas laborales y la correcta liquidación del tiempo extraordinario. El sistema informático de planillas deberá contemplar las siguientes disposiciones: (Ver documento)[Tecnica-ISR-2025.md]

### **2.4.5 Semana laboral, jornada ordinaria y horas extras** 
**Jornada ordinaria de trabajo:** Según lo estipulado en el Artículo 161, la jornada ordinaria se divide en dos periodos principales con límites máximos específicos:

* **Jornada diurna:** Está comprendida entre las 6:00 a.m. y las 7:00 p.m. de un mismo día. El tiempo de trabajo efectivo no debe exceder de las 8 horas diarias ni las 44 horas semanales.  
* **Jornada nocturna:** Está comprendida entre las 7:00 p.m. y las 6:00 a.m. del día siguiente. En este caso, el tiempo de trabajo efectivo no debe exceder de las 7 horas diarias ni las 39 horas semanales.

Adicionalmente, la ley exige un pago diferencial por trabajar de noche. El Artículo 168 establece que el trabajo realizado en horas nocturnas debe ser remunerado con un recargo del 25% sobre el salario base establecido para el trabajo diurno.

**Horas extras (trabajo extraordinario):** Cualquier hora de trabajo que exceda los límites máximos de la jornada ordinaria se considera tiempo extraordinario y requiere una compensación mayor para el trabajador, tal como lo dicta el Artículo 169:

* **horas extras diurnas:** Deben ser remuneradas con un recargo del 100% sobre el salario básico por hora. Es decir, se pagan al doble de la tarifa normal.  
* **horas extras nocturnas:** Deben ser remuneradas con un recargo del 100%, pero calculado sobre el salario básico por hora previamente incrementado con el 25% de nocturnidad.

El módulo de administración de planillas propuesto para COMSERTEL S.A. de C.V. incorporará la lógica necesaria para recibir el total de horas ordinarias y extras digitadas. El algoritmo de costeo multiplicará automáticamente las tarifas y recargos correspondientes, garantizando un pago legal al colaborador y previniendo multas del Ministerio de Trabajo.

## **2.5 Vacaciones**

Conforme a lo regulado en el Artículo 177 del Código de Trabajo de El Salvador, la prestación de vacaciones anuales remuneradas es un derecho inalienable para todo empleado después de un año de trabajo continuo en la misma empresa o establecimiento. La legislación exige el otorgamiento de un período de descanso equivalente a 15 días continuos.

Además de la remuneración ordinaria que corresponde a este período, el patrono tiene la obligación de reconocer una prima vacacional. Según el mismo artículo, el patrono debe pagar al trabajador, en concepto de prima por vacaciones, una cantidad equivalente al 30% del salario de esos 15 días. El sistema de planillas propuesto deberá registrar las fechas de inicio de labores de cada colaborador para calcular automáticamente el pago de este pasivo al cumplirse cada año de servicio continuo.

## **2.6 Aguinaldo**

El aguinaldo es una prima en concepto de compensación económica anual que todo empleador salvadoreño está obligado a otorgar a sus empleados, conforme a lo establecido en el Artículo 196 del Código de Trabajo. El pago debe efectuarse obligatoriamente durante el mes de diciembre (entre el 12 y el 20), reconociendo el esfuerzo del trabajador durante el año cursado.  
Según el Artículo 198 del Código de Trabajo, la cuantía mínima del aguinaldo se calcula de forma proporcional a la antigüedad del colaborador dentro de la organización, bajo la siguiente escala:

* Para empleados con 1 a menos de 3 años de servicio: equivalente al salario de 15 días.  
* Para empleados con 3 a menos de 10 años de servicio: equivalente al salario de 19 días.  
* Para empleados con 10 o más años de servicio: equivalente al salario de 21 días.

El sistema deberá automatizar estos cálculos, respetando, además, las disposiciones transitorias que anualmente emite la Asamblea Legislativa, las cuales suelen eximir de Impuesto sobre la Renta a los aguinaldos que no excedan ciertos salarios mínimos.

## **2.7 Quincena Veinticinco (Decreto No. 499)**

La "Quincena Veinticinco" es una prestación económica extraordinaria anual aplicable en El Salvador a partir de 2026.

* **Elegibilidad:** Empleados del sector público, municipal y privado con un salario nominal mensual menor o igual a $1,500.00 USD.
* **Monto:** Equivalente al 50% del salario básico o nominal mensual del trabajador.
* **Calendario de Pago:** Se efectúa entre el 15 y el 25 de enero de cada año.
* **Vigencia en Sector Privado:**
  * Año 2026: Voluntario (el patrono puede decidir no pagarlo, pero de hacerlo goza de crédito fiscal).
  * Año 2027 en adelante: Obligatorio para todas las empresas.
* **Vigencia en Sector Público/Municipal:** Obligatorio a partir de 2026.
* **Finiquitos y Liquidaciones:** Si un trabajador calificado es despedido sin causa justa en enero antes del 25 de enero de ese año, tiene derecho al pago proporcional acumulado de la Quincena Veinticinco calculada según la antigüedad (prorrata anual).
* **Exención Fiscal y de Ley:** El monto de esta prestación goza de inembargabilidad absoluta y está exento en un 100% de retenciones de seguridad social (ISSS), cotización previsional (AFP) e Impuesto sobre la Renta (ISR). Tampoco se toma como base para el aguinaldo ni las vacaciones.


## **ALGORITMO Calculo_De_Planilla_Salarial**

INICIO

// 1. Identificación y recopilación de datos base
LEER Salario_Base, Cargo
LEER Dias_Laborados, Horas_Extra
LEER Ausencias_Injustificadas, Llegadas_Tardias  // Obtenido del Módulo de Ausencias e Incapacidades
LEER Total_Empleados_Empresa                    // Variable necesaria para validar aporte INCAF
LEER Fecha_Calculo, Fecha_Ingreso               // Fechas para cálculos temporales
LEER Es_Sector_Publico, Es_Voluntario_Aceptado  // Flags para Quincena Veinticinco en 2026
LEER Es_Finiquito                               // Flag de cálculo por liquidación
LEER Es_Agropecuario, Es_Temporal_Agricola      // Parámetros de sector para INCAF

// 2. Cálculo de descuentos por tiempo no laborado
Descuento_Ausencias <- CalcularDescuento(Ausencias_Injustificadas, Llegadas_Tardias)
Monto_Horas_Extra <- CalcularHorasExtra(Horas_Extra)

Aguinaldo <- 0
Vacaciones <- 0
Quincena_Veinticinco <- 0

// 3. Evaluación de beneficios anuales: Aguinaldo
SI Mes_Actual == "Diciembre" ENTONCES
    Aguinaldo <- CalcularAguinaldo(Anios_Servicio) // Proporcional a años de servicio (Art. 198)
FIN SI

// 4. Evaluación de beneficios anuales: Vacaciones
SI Cumple_Anio_Servicio_Continuo == VERDADERO ENTONCES
    Vacaciones <- CalcularPagoVacaciones(Salario_Base) // 15 días de salario base + prima del 30%
FIN SI

// 5. Evaluación de prestación extraordinaria: Quincena Veinticinco (Decreto No. 499)
Quincena_Veinticinco <- CalcularQuincenaVeinticinco(Salario_Base, Fecha_Calculo, Fecha_Ingreso, Es_Voluntario_Aceptado, Es_Sector_Publico, Es_Finiquito)

// 6. Cálculo del Salario Nominal Devengado
Salario_Nominal_Devengado <- Salario_Base + Monto_Horas_Extra - Descuento_Ausencias + Aguinaldo + Vacaciones + Quincena_Veinticinco

// Lógica de exención de Aguinaldo y Quincena Veinticinco de acuerdo a la ley de El Salvador
// Ambas prestaciones no cotizan seguridad social ni renta
Salario_Cotizable_Seguridad_Social <- Salario_Nominal_Devengado - Aguinaldo - Quincena_Veinticinco

// 7. Cálculo de Retenciones de Ley
Base_Cotizable_ISSS <- MIN(Salario_Cotizable_Seguridad_Social, 1000.00)
Retencion_ISSS <- Base_Cotizable_ISSS * 0.03

Base_Cotizable_AFP <- MIN(Salario_Cotizable_Seguridad_Social, 7028.29) // Techo AFP vigente
Retencion_AFP <- Base_Cotizable_AFP * 0.0725

// 8. Cálculo del Salario Gravado para Renta (excluye aguinaldo y Quincena Veinticinco)
Salario_Gravado <- Salario_Cotizable_Seguridad_Social - Retencion_ISSS - Retencion_AFP

// 9. Cálculo de Impuesto sobre la Renta (ISR)
Retencion_Renta <- 0

SI Salario_Gravado > 550.00 ENTONCES
    // Ubicar en Tabla de Retención (Tramos II, III o IV)
    Valor_Exceso <- ObtenerExcesoTabla(Salario_Gravado)
    Porcentaje_Aplicar <- ObtenerPorcentajeTabla(Salario_Gravado)
    Cuota_Fija <- ObtenerCuotaFijaTabla(Salario_Gravado)
    
    // Fórmula de la tabla de retención
    Retencion_Renta <- ((Salario_Gravado - Valor_Exceso) * Porcentaje_Aplicar) + Cuota_Fija
SINO
    // Aplicar Tramo I (Decreto 10 - 2025)
    Retencion_Renta <- 0.00
FIN SI

// 10. Cálculo final y emisión de la Boleta
Retenciones_Totales <- Retencion_ISSS + Retencion_AFP + Retencion_Renta
Salario_Liquido_Pagar <- Salario_Nominal_Devengado - Retenciones_Totales

GENERAR_Y_EMITIR "Boleta de Pago Individual con detalle de Salario Líquido: ", Salario_Liquido_Pagar

// 11. Cálculo de Aportes Patronales (Provisiones contables de la Empresa)
Aporte_Patronal_ISSS <- Base_Cotizable_ISSS * 0.075
Aporte_Patronal_AFP <- Base_Cotizable_AFP * 0.0875
Aporte_Patronal_INCAF <- 0

SI Total_Empleados_Empresa >= 10 ENTONCES
    // El INCAF comparte el mismo techo de $1,000 que el ISSS y evalúa la tasa según sector
    SI Es_Agropecuario == VERDADERO ENTONCES
        SI Es_Temporal_Agricola == FALSO ENTONCES
            Aporte_Patronal_INCAF <- Base_Cotizable_ISSS * 0.0025
        FIN SI
    SINO
        Aporte_Patronal_INCAF <- Base_Cotizable_ISSS * 0.01
    FIN SI
FIN SI

GUARDAR_PROVISIONES Aporte_Patronal_ISSS, Aporte_Patronal_AFP, Aporte_Patronal_INCAF

FIN

> [!NOTE]
> **Nota de actualización:** Se corrigieron las fórmulas del algoritmo para eximir el Aguinaldo y la Quincena Veinticinco de los cálculos de cotizaciones previsionales (AFP), seguro de salud (ISSS) e Impuesto sobre la Renta (ISR) a fin de respetar la legislación de El Salvador. También se ajustó el techo cotizable de AFP a $7,028.29, se introdujo el cálculo exento de la Quincena Veinticinco y se integró la condición de obligatoriedad y tasas especiales de INCAF basadas en el sector agropecuario y la nómina de diez o más trabajadores.

>El símbolo <- que ves en el documento Canvas se conoce como operador de asignación.

>En pseudocódigo y diagramas de flujo, este símbolo significa que el valor o el resultado de la operación que está a la derecha se "guarda" o se "asigna" a la variable que está a la izquierda.

>Por ejemplo, en la línea que seleccionaste:
Vacaciones <- CalcularPagoVacaciones(Salario_Base)

>Se lee de la siguiente manera: "Calcula el pago de vacaciones usando el salario base, y asigna/guarda ese resultado dentro de la variable llamada Vacaciones".

>Es el equivalente a usar el signo de igual (=) en la mayoría de los lenguajes de programación. En los diagramas o pseudocódigo se prefiere usar la flecha <- para asignaciones, dejando el doble igual == o el igual simple = estrictamente para hacer comparaciones (por ejemplo, preguntar si Mes_Actual == "Diciembre").
