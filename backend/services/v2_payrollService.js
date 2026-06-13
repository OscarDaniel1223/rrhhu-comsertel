/**
 * Servicio de Cálculo de Planilla y Nómina (v2)
 * Implementa la lógica de cálculo salarial, descuentos por ausencias,
 * retenciones de ley (ISSS, AFP, INCAF) e Impuesto sobre la Renta (ISR) 2025 de El Salvador.
 * Incluye la evaluación de prestaciones de Aguinaldo y Vacaciones de ley.
 */

const parseFechaSinTimezone = (f) => {
  if (f instanceof Date) {
    // Retornamos una nueva fecha solo con año, mes y día para evitar interferencia de horas
    return new Date(f.getFullYear(), f.getMonth(), f.getDate());
  }
  if (typeof f === 'string') {
    const fechaString = f.substring(0, 10);
    const partes = fechaString.split('-');
    if (partes.length === 3) {
      return new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
    }
  }
  const d = new Date(f);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

class V2_PayrollService {
  /**
   * Calcula los días de ausencia injustificada aprobada dentro de un período dado y el descuento correspondiente.
   * @param {number} salarioBase Salario mensual base del empleado.
   * @param {Array} ausencias Lista de ausencias registradas para el empleado.
   * @param {Date|string} fechaInicioPeriodo Fecha de inicio de la planilla.
   * @param {Date|string} fechaFinPeriodo Fecha de fin de la planilla.
   * @returns {Object} { diasAusencia: number, descuento: number }
   */
  static calcularDescuentoAusencias(salarioBase, ausencias, fechaInicioPeriodo, fechaFinPeriodo) {
    const pInicio = parseFechaSinTimezone(fechaInicioPeriodo);
    const pFin = parseFechaSinTimezone(fechaFinPeriodo);
    const salarioDia = salarioBase / 30.0;
    let totalDiasAusencia = 0;
    let totalDescuento = 0.0;

    if (!ausencias || !Array.isArray(ausencias)) {
      return { diasAusencia: 0, descuento: 0.00 };
    }

    ausencias.forEach((ausencia) => {
      // Solo ausencias injustificadas aprobadas descuentan salario
      if (ausencia.tipo === 'AUSENCIA_INJUSTIFICADA' && ausencia.estado === 'APROBADA') {
        const aInicio = parseFechaSinTimezone(ausencia.fecha_inicio);
        const aFin = parseFechaSinTimezone(ausencia.fecha_fin);

        // Verificar si hay traslape entre el rango de la ausencia y el rango del período de planilla
        const maxInicio = aInicio > pInicio ? aInicio : pInicio;
        const minFin = aFin < pFin ? aFin : pFin;

        if (maxInicio <= minFin) {
          // Diferencia en días (incluyendo el día de inicio y fin)
          const diffTime = minFin.getTime() - maxInicio.getTime();
          const diasTraslape = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
          
          totalDiasAusencia += diasTraslape;
          totalDescuento += diasTraslape * salarioDia;
        }
      }
    });

    return {
      diasAusencia: totalDiasAusencia,
      descuento: Math.round(totalDescuento * 100) / 100
    };
  }

  /**
   * Calcula la deducción de AFP (Cotización Previsional) del empleado y patrono.
   * AFP Empleado: 7.25%, AFP Patrono: 8.75%
   * Límite de cotización (techo) para AFP mensual: $7,028.29
   * @param {number} salarioDevengado Salario devengado cotizable.
   * @returns {Object} { empleado: number, patrono: number }
   */
  static calcularAFP(salarioDevengado) {
    const techoAFP = 7028.29;
    const salarioCotizable = Math.min(salarioDevengado, techoAFP);

    const afpEmpleado = salarioCotizable * 0.0725;
    const afpPatrono = salarioCotizable * 0.0875;

    return {
      empleado: Math.round(afpEmpleado * 100) / 100,
      patrono: Math.round(afpPatrono * 100) / 100
    };
  }

  /**
   * Calcula la deducción de ISSS (Seguro Social) del empleado y patrono.
   * ISSS Empleado: 3.00%, ISSS Patrono: 7.50%
   * Límite de cotización (techo) para ISSS mensual: $1,000.00
   * @param {number} salarioDevengado Salario devengado cotizable.
   * @returns {Object} { empleado: number, patrono: number }
   */
  static calcularISSS(salarioDevengado) {
    const techoISSS = 1000.00;
    const salarioCotizable = Math.min(salarioDevengado, techoISSS);

    const isssEmpleado = salarioCotizable * 0.0300;
    const isssPatrono = salarioCotizable * 0.0750;

    return {
      empleado: Math.round(isssEmpleado * 100) / 100,
      patrono: Math.round(isssPatrono * 100) / 100
    };
  }

  /**
   * Calcula el aporte patronal de INCAF (antes INSAFORP).
   * INCAF Patrono: 1.00%
   * Límite de cotización (techo) para INCAF mensual (igual a ISSS): $1,000.00
   * @param {number} salarioDevengado Salario devengado cotizable.
   * @returns {number} Monto correspondiente a INCAF patronal.
   */
  static calcularINCAF(salarioDevengado) {
    const techoINCAF = 1000.00;
    const salarioCotizable = Math.min(salarioDevengado, techoINCAF);
    const incafPatrono = salarioCotizable * 0.0100;

    return Math.round(incafPatrono * 100) / 100;
  }

  /**
   * Calcula la retención del Impuesto sobre la Renta (ISR) para el año 2025.
   * @param {number} salarioDevengado Salario devengado gravado.
   * @param {number} afpEmpleado Deducción de AFP del empleado.
   * @param {number} isssEmpleado Deducción de ISSS del empleado.
   * @param {string} tipoPeriodo Tipo de periodo de la planilla ('MENSUAL' o 'QUINCENAL').
   * @returns {number} Retención de renta calculada.
   */
  static calcularISR(salarioDevengado, afpEmpleado, isssEmpleado, tipoPeriodo = 'MENSUAL') {
    let baseGravada = salarioDevengado - afpEmpleado - isssEmpleado;

    if (baseGravada <= 0) {
      return 0.00;
    }

    const periodo = tipoPeriodo.toUpperCase();

    // Regla Especial del Tramo II (Deducción fija de $1,600 anuales para ingresos <= $9,100 anuales)
    // Ingreso anual estimado
    const periodosPorAnio = periodo === 'QUINCENAL' ? 24 : 12;
    const ingresoAnualEstimado = salarioDevengado * periodosPorAnio;

    if (ingresoAnualEstimado <= 9100.00) {
      const deduccionProporcional = 1600.00 / periodosPorAnio;
      baseGravada = Math.max(0, baseGravada - deduccionProporcional);
    }

    if (baseGravada <= 0) {
      return 0.00;
    }

    // Tablas de retención según periodo
    if (periodo === 'QUINCENAL') {
      // Tabla Quincenal 2025
      if (baseGravada <= 275.00) {
        return 0.00; // Tramo I
      } else if (baseGravada <= 447.62) {
        // Tramo II
        return Math.round((((baseGravada - 275.00) * 0.10) + 8.83) * 100) / 100;
      } else if (baseGravada <= 1019.05) {
        // Tramo III
        return Math.round((((baseGravada - 447.62) * 0.20) + 30.00) * 100) / 100;
      } else {
        // Tramo IV
        return Math.round((((baseGravada - 1019.05) * 0.30) + 144.28) * 100) / 100;
      }
    } else {
      // Tabla Mensual 2025 (Por defecto)
      if (baseGravada <= 550.00) {
        return 0.00; // Tramo I
      } else if (baseGravada <= 895.24) {
        // Tramo II
        return Math.round((((baseGravada - 550.00) * 0.10) + 17.67) * 100) / 100;
      } else if (baseGravada <= 2038.10) {
        // Tramo III
        return Math.round((((baseGravada - 895.24) * 0.20) + 60.00) * 100) / 100;
      } else {
        // Tramo IV
        return Math.round((((baseGravada - 2038.10) * 0.30) + 288.57) * 100) / 100;
      }
    }
  }

  /**
   * Calcula la prima de vacaciones ordinaria o proporcional (Art. 177 Código de Trabajo de El Salvador).
   * La vacación completa equivale a 15 días de salario base más una prima del 30% sobre esos 15 días.
   * @param {number} salarioBase Salario mensual base del cargo.
   * @param {boolean} cumpleAnioContinuo Si el empleado ha completado un año continuo de servicio.
   * @param {number} diasTrabajadosEnAnio Días laborados en el año de servicio actual (opcional para proporcional).
   * @returns {number} Monto a pagar por vacaciones.
   */
  static calcularVacaciones(salarioBase, cumpleAnioContinuo, diasTrabajadosEnAnio = 365) {
    if (cumpleAnioContinuo) {
      // 15 días de salario + 30% de prima
      const pagoVacacion = (salarioBase / 2.0) * 1.30;
      return Math.round(pagoVacacion * 100) / 100;
    }
    
    // Proporcional
    if (diasTrabajadosEnAnio > 0 && diasTrabajadosEnAnio < 365) {
      const diasProporcionales = (diasTrabajadosEnAnio / 365.0) * 15.0;
      const pagoVacacionProporcional = diasProporcionales * (salarioBase / 30.0) * 1.30;
      return Math.round(pagoVacacionProporcional * 100) / 100;
    }

    return 0.00;
  }

  /**
   * Calcula el aguinaldo anual de ley (Art. 196-198 Código de Trabajo de El Salvador).
   * @param {number} salarioBase Salario mensual base del cargo.
   * @param {Date|string} fechaIngreso Fecha de contratación del empleado.
   * @param {Date|string} fechaCalculo Fecha de liquidación o cálculo (generalmente en Diciembre).
   * @returns {number} Monto a pagar por aguinaldo.
   */
  static calcularAguinaldo(salarioBase, fechaIngreso, fechaCalculo = new Date()) {
    const fIngreso = parseFechaSinTimezone(fechaIngreso);
    const fCalculo = parseFechaSinTimezone(fechaCalculo);

    // Calcular antigüedad en días
    const diffTime = fCalculo.getTime() - fIngreso.getTime();
    if (diffTime < 0) return 0.00;

    const diasAntiguedad = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const aniosAntiguedad = diasAntiguedad / 365.25; // Considerando años bisiestos

    const salarioDia = salarioBase / 30.0;

    if (aniosAntiguedad < 1.0) {
      // Proporcional a los días laborados basados en una escala base de 15 días
      const diasProporcionalesAguinaldo = (diasAntiguedad / 365.0) * 15.0;
      const aguinaldoProporcional = diasProporcionalesAguinaldo * salarioDia;
      return Math.round(aguinaldoProporcional * 100) / 100;
    } else if (aniosAntiguedad < 3.0) {
      // 1 a menos de 3 años de servicio: equivalente a 15 días de salario
      return Math.round((salarioDia * 15.0) * 100) / 100;
    } else if (aniosAntiguedad < 10.0) {
      // 3 a menos de 10 años de servicio: equivalente a 19 días de salario
      return Math.round((salarioDia * 19.0) * 100) / 100;
    } else {
      // 10 o más años de servicio: equivalente a 21 días de salario
      return Math.round((salarioDia * 21.0) * 100) / 100;
    }
  }

  /**
   * Realiza el desglose completo de nómina y costeo patronal para generar una boleta de pago.
   * @param {number} salarioBase Salario mensual base según cargo del empleado.
   * @param {Array} ausencias Lista de ausencias de este empleado.
   * @param {number} beneficios Beneficios adicionales (bonos, comisiones, etc.).
   * @param {number} aguinaldo Aguinaldo pagado en el período (opcional, exento de ISSS/AFP por ley).
   * @param {number} vacaciones Pago de vacaciones en el período (opcional, cotizable).
   * @param {string} tipoPeriodo Tipo de período de la planilla ('MENSUAL' o 'QUINCENAL').
   * @param {Date|string} fechaInicio Fecha de inicio del período de planilla.
   * @param {Date|string} fechaFin Fecha de fin del período de planilla.
   * @param {number} totalEmpleadosEmpresa Cantidad total de empleados en la empresa (para validar INCAF).
   * @returns {Object} Desglose completo de la boleta de pago.
   */
  static calcularBoletaPago(
    salarioBase,
    ausencias,
    beneficios = 0.0,
    aguinaldo = 0.0,
    vacaciones = 0.0,
    tipoPeriodo = 'MENSUAL',
    fechaInicio,
    fechaFin,
    totalEmpleadosEmpresa = 10
  ) {
    const periodo = tipoPeriodo.toUpperCase();
    
    // El salario base asignado para el periodo correspondiente:
    // Si la planilla es quincenal, el salario base proporcional es la mitad del salario base mensual
    const salarioBasePeriodo = periodo === 'QUINCENAL' ? salarioBase / 2.0 : salarioBase;

    // Calcular ausencias
    const { diasAusencia, descuento } = this.calcularDescuentoAusencias(salarioBase, ausencias, fechaInicio, fechaFin);

    // Salario Nominal Devengado (sumando beneficios, vacaciones, aguinaldo y restando ausencias)
    const salarioDevengado = Math.max(0.00, salarioBasePeriodo + beneficios + vacaciones + aguinaldo - descuento);

    // Para efectos de ISSS y AFP, por ley de El Salvador el Aguinaldo ordinario está exento de cotizaciones.
    // Calculamos el salario cotizable restando el aguinaldo:
    const salarioCotizableSeguridadSocial = Math.max(0.00, salarioDevengado - aguinaldo);

    // Deducciones empleado y aportes patronales basadas en el salario cotizable de seguridad social
    const afp = this.calcularAFP(salarioCotizableSeguridadSocial);
    const isss = this.calcularISSS(salarioCotizableSeguridadSocial);
    
    // El aporte de INCAF (1%) aplica solo si la empresa tiene 10 o más empleados.
    // Comparte el techo de $1,000.00 del ISSS.
    let incafPatrono = 0.00;
    if (totalEmpleadosEmpresa >= 10) {
      incafPatrono = this.calcularINCAF(salarioCotizableSeguridadSocial);
    }

    // Retención de Renta (ISR 2025)
    // Dado que el aguinaldo ordinario está exento por ley de El Salvador, calculamos el ISR sobre la renta gravada sin aguinaldo:
    const salarioParaRenta = Math.max(0.00, salarioDevengado - aguinaldo);
    const renta = this.calcularISR(salarioParaRenta, afp.empleado, isss.empleado, periodo);

    // Salario Neto (Líquido a recibir)
    const salarioNeto = salarioDevengado - isss.empleado - afp.empleado - renta;

    // Calcular días trabajados proporcionales
    const diasMaximosPeriodo = periodo === 'QUINCENAL' ? 15 : 30;
    const diasTrabajados = Math.max(0, diasMaximosPeriodo - diasAusencia);

    return {
      dias_trabajados: diasTrabajados,
      descuento_ausencias: Math.round(descuento * 100) / 100,
      salario_devengado: Math.round(salarioDevengado * 100) / 100,
      isss_empleado: isss.empleado,
      afp_empleado: afp.empleado,
      renta: renta,
      salario_neto: Math.round(salarioNeto * 100) / 100,
      isss_patrono: isss.patrono,
      afp_patrono: afp.patrono,
      insaforp_patrono: incafPatrono // Mantiene el nombre de columna de BD 'insaforp_patrono' para compatibilidad
    };
  }
}

module.exports = V2_PayrollService;
