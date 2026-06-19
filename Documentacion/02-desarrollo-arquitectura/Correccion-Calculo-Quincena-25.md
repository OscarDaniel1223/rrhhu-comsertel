# Correccion del Calculo de Quincena Veinticinco (Sprint 5)

Este documento describe la investigacion, causa raiz y la solucion implementada para corregir el bug en la generacion y persistencia del beneficio de la Quincena Veinticinco en el mes de enero.

---

## 1. Sintomas del Problema

Al generar una planilla ordinaria (mensual o quincenal) para el mes de enero de 2026 en la interfaz de usuario:
1. El checklist de **"Aplicar Quincena Veinticinco (Voluntario 2026)"** aparecia correctamente y era marcado por el administrador.
2. Al dar clic en **"Procesar y Generar Planilla"**, la planilla se creaba sin errores, pero el monto de la Quincena Veinticinco no se visualizaba en los desgloses consolidados ni en las boletas individuales.
3. Al inspeccionar la base de datos MariaDB, la columna `quincena_veinticinco` en la tabla `boletas_pago` se almacenaba con un valor de `0.00` para todos los empleados de la planilla.

---

## 2. Causa Raiz

El problema residia en las validaciones de fecha del motor de nomina en el archivo [v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js). 

En el metodo `calcularQuincenaVeinticinco`, se habia implementado la siguiente validacion para el pago ordinario:
```javascript
// Calculo ordinario: debe cobrarse en enero entre el 15 y el 25
if (!esFiniquito) {
  if (mes === 0 && dia >= 15 && dia <= 25) {
    return Math.round(montoCompleto * 100) / 100;
  }
  return 0.00;
}
```

### El Conflicto con la Fecha Fin de Planilla:
* Al generar la planilla mensual de enero, el backend evalua cada boleta utilizando como `fechaCalculo` la fecha fin del periodo, que corresponde al **31 de enero** (`2026-01-31`).
* En esta fecha, la variable `dia` es igual a `31`.
* Como el dia `31` no cumple con la condicion `dia >= 15 && dia <= 25`, el motor de nomina retornaba `0.00` de forma automatica, ignorando que se trataba de una planilla ordinaria del mes de enero.
* De igual forma ocurria con la segunda quincena de enero, cuya fecha de corte fin de periodo tambien es el **31 de enero**.

---

## 3. Solucion Aplicada

Se flexibilizo la validacion de fecha del calculo ordinario en el archivo [v2_payrollService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/backend/services/v2_payrollService.js) para remover la restriccion del dia del mes. 

Dado que el checklist es controlado por el administrador desde la UI y solo se muestra para periodos pertenecientes al mes de enero, es correcto y seguro asumir que si la planilla pertenece al mes de enero (`mes === 0`), se debe calcular y pagar el beneficio completo (50% del salario base nominal) sin importar la fecha de corte exacta del periodo de pago.

### Codigo Modificado:
```javascript
// Calculo ordinario: debe cobrarse en el mes de enero
if (!esFiniquito) {
  if (mes === 0) {
    return Math.round(montoCompleto * 100) / 100;
  }
  return 0.00;
}
```

Con esta correccion, al procesar planillas mensuales (corte al 31 de enero) o quincenales (corte al 15 o al 31 de enero), la Quincena Veinticinco se calcula, se almacena fisicamente en la base de datos y se refleja correctamente en las interfaces de usuario.
