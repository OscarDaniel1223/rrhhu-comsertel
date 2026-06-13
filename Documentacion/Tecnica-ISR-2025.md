Lógica de Negocio y Tablas de Retención ISR 2025 (El Salvador)

Basado en: Decreto Ejecutivo No. 10 (30 de abril de 2025).
Cambio principal: Ampliación de la base exenta a $550.00 mensuales ($6,600.00 anuales).

1. Reglas de Negocio (Business Rules)

1.1 Cálculo de la Base Gravada (Monto sujeto a retención)

El impuesto no se calcula sobre el salario bruto. Antes de buscar en la tabla, se debe calcular la remuneración gravada:
Base Gravada = Remuneración Total - Remuneraciones No Gravadas - Cotizaciones de Seguridad Social (ISSS) - Cotizaciones Previsionales (AFP)

1.2 Regla Especial Tramo II (Deducción no incorporada)

Para las personas cuyo ingreso anual proyectado sea igual o inferior a $9,100.00, la ley otorga una deducción fija de $1,600.00 anuales.

Aviso para el código: Las tablas de retención no incluyen esta deducción en el Tramo II. El sistema de planillas debe deducir la proporción correspondiente al período (ej. $133.33 al mes) antes de calcular la retención si aplica a este caso, según el Art. 29 num. 7 de la Ley de ISR.

1.3 Períodos de Pago Especiales (Bonos, Aguinaldos, Vacaciones)

Se suman al salario mensual.

Se calcula la retención sobre el total usando la tabla Mensual.

Al impuesto resultante se le resta la porción que correspondería retener solo por el salario base mensual. La diferencia es el impuesto a descontar del bono/extra.

1.4 Pluriempleo (Dos o más patronos)

Patrono principal (mayor salario): Aplica la tabla de retención normal.

Patronos secundarios: Aplican una retención plana del 10% sobre las sumas pagadas (sin usar la tabla).

2. Fórmula de Cálculo del Impuesto

Una vez identificada la tabla y el tramo correspondiente a la Base Gravada:
Impuesto a Retener = ((Base Gravada - Exceso) * Porcentaje) + Cuota Fija

3. Tablas de Retención (Estructuras de Datos Sugeridas)

A continuación, las tablas formateadas en arreglos de objetos (estilo JSON) para fácil implementación en lenguajes como JavaScript, Python, C#, etc.

3.1 Tabla Mensual

[
  { "tramo": 1, "min": 0.01, "max": 550.00, "porcentaje": 0.00, "exceso": 0.00, "cuota_fija": 0.00 },
  { "tramo": 2, "min": 550.01, "max": 895.24, "porcentaje": 0.10, "exceso": 550.00, "cuota_fija": 17.67 },
  { "tramo": 3, "min": 895.25, "max": 2038.10, "porcentaje": 0.20, "exceso": 895.24, "cuota_fija": 60.00 },
  { "tramo": 4, "min": 2038.11, "max": null, "porcentaje": 0.30, "exceso": 2038.10, "cuota_fija": 288.57 }
]


3.2 Tabla Quincenal

[
  { "tramo": 1, "min": 0.01, "max": 275.00, "porcentaje": 0.00, "exceso": 0.00, "cuota_fija": 0.00 },
  { "tramo": 2, "min": 275.01, "max": 447.62, "porcentaje": 0.10, "exceso": 275.00, "cuota_fija": 8.83 },
  { "tramo": 3, "min": 447.63, "max": 1019.05, "porcentaje": 0.20, "exceso": 447.62, "cuota_fija": 30.00 },
  { "tramo": 4, "min": 1019.06, "max": null, "porcentaje": 0.30, "exceso": 1019.05, "cuota_fija": 144.28 }
]


3.3 Tabla Semanal

[
  { "tramo": 1, "min": 0.01, "max": 137.50, "porcentaje": 0.00, "exceso": 0.00, "cuota_fija": 0.00 },
  { "tramo": 2, "min": 137.51, "max": 223.81, "porcentaje": 0.10, "exceso": 137.50, "cuota_fija": 4.42 },
  { "tramo": 3, "min": 223.82, "max": 509.52, "porcentaje": 0.20, "exceso": 223.81, "cuota_fija": 15.00 },
  { "tramo": 4, "min": 509.53, "max": null, "porcentaje": 0.30, "exceso": 509.52, "cuota_fija": 72.14 }
]


4. Tablas de Recálculo (Junio y Diciembre)

Lógica del Recálculo:

Sumar todas las rentas gravadas del semestre (Ene-Jun) o del año (Ene-Dic).

Calcular el ISR sobre ese total acumulado usando la tabla respectiva (abajo).

Restar el ISR que ya se le retuvo en los meses anteriores (Ene-May para Junio; Ene-Nov para Diciembre).

El resultado positivo es el ISR a descontar en Junio/Diciembre. Si es negativo, no se retiene nada ($0.00).

4.1 Recálculo de Junio (Acumulado Enero - Junio)

[
  { "tramo": 1, "min": 0.01, "max": 3300.00, "porcentaje": 0.00, "exceso": 0.00, "cuota_fija": 0.00 },
  { "tramo": 2, "min": 3300.01, "max": 5371.44, "porcentaje": 0.10, "exceso": 3300.00, "cuota_fija": 106.20 },
  { "tramo": 3, "min": 5371.45, "max": 12228.60, "porcentaje": 0.20, "exceso": 5371.44, "cuota_fija": 360.00 },
  { "tramo": 4, "min": 12228.61, "max": null, "porcentaje": 0.30, "exceso": 12228.60, "cuota_fija": 1731.42 }
]


4.2 Recálculo de Diciembre (Acumulado Enero - Diciembre)

[
  { "tramo": 1, "min": 0.01, "max": 6600.00, "porcentaje": 0.00, "exceso": 0.00, "cuota_fija": 0.00 },
  { "tramo": 2, "min": 6600.01, "max": 10742.86, "porcentaje": 0.10, "exceso": 6600.00, "cuota_fija": 212.12 },
  { "tramo": 3, "min": 10742.87, "max": 24457.14, "porcentaje": 0.20, "exceso": 10742.86, "cuota_fija": 720.00 },
  { "tramo": 4, "min": 24457.15, "max": null, "porcentaje": 0.30, "exceso": 24457.14, "cuota_fija": 3462.86 }
]


5. Pseudocódigo Sugerido (Algoritmo Principal)

function calcularISR(salarioBruto, afp, isss, periodo) {
    // 1. Obtener Base Gravada
    let baseGravada = salarioBruto - afp - isss;
    
    // 2. Cargar tabla según período ('mensual', 'quincenal', 'semanal')
    let tabla = obtenerTablaPorPeriodo(periodo);
    
    // 3. Evaluar Tramo II (Regla de $9,100 anuales - opcional dependiendo del motor de nómina)
    // if (salarioBrutoAnualProyectado <= 9100) { 
    //    baseGravada -= deduccionProporcional1600; 
    // }

    if (baseGravada <= 0) return 0.00;

    // 4. Buscar el tramo correspondiente
    let tramoAplicable = tabla.find(t => baseGravada >= t.min && (t.max === null || baseGravada <= t.max));

    // 5. Aplicar fórmula
    if (tramoAplicable.porcentaje === 0.00) return 0.00;

    let impuesto = ((baseGravada - tramoAplicable.exceso) * tramoAplicable.porcentaje) + tramoAplicable.cuota_fija;
    
    return Math.round(impuesto * 100) / 100; // Redondear a 2 decimales
}
