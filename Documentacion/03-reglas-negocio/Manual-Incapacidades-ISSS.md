# Manual de Usuario: Registro de Incapacidades y Trámites ante el ISSS

Este documento describe detalladamente el funcionamiento del módulo de gestión de Ausencias e Incapacidades en el sistema de recursos humanos de COMSERTEL, así como los lineamientos legales del Instituto Salvadoreño del Seguro Social (ISSS) aplicados al cálculo de nómina.

---

## 1. Módulo de Ausencias e Incapacidades en el Sistema

El sistema permite registrar, controlar y auditar las incidencias operativas del personal que afectan el cálculo de la planilla y las cotizaciones de seguridad social.

### 1.1 Tipos de Incidencias Admitidas
El sistema parametriza tres tipos principales de incidencias en la tabla `ausencias_incapacidades`:

1.  **AUSENCIA_INJUSTIFICADA:**
    *   **Definición:** Inasistencia al trabajo sin justificación legal ni autorización patronal.
    *   **Efecto en Nómina:** Descuenta de forma automática los días no laborados sobre el salario del período en curso, calculados a razón de $Salario\_Base / 30$ por día.
2.  **PERMISO_GOCE:**
    *   **Definición:** Permiso autorizado con goce de sueldo (ej. licencias por duelo, matrimonio o permisos personales aprobados).
    *   **Efecto en Nómina:** No genera deducción de salario ni afecta la cotización de seguridad social.
3.  **INCAPACIDAD_ISSS:**
    *   **Definición:** Suspensión temporal de labores debido a enfermedad común, accidente o maternidad, debidamente respaldada por un certificado de incapacidad emitido por el ISSS.
    *   **Efecto en Nómina:** Exime al trabajador de deducción por inasistencia y activa el flujo de subsidios correspondiente.

---

## 2. Flujo de Registro y Aprobación en el Sistema

### Paso 1: Solicitud o Registro del Incidente
El personal de Recursos Humanos o el jefe directo registra la incidencia a través de la interfaz del sistema:
1.  Ingresar al panel de **Control de Ausencias e Incapacidades** en el Dashboard.
2.  Hacer clic en **Registrar Incidencia**.
3.  Seleccionar al **Empleado** de la lista activa.
4.  Definir el **Tipo** de incidencia (`AUSENCIA_INJUSTIFICADA`, `PERMISO_GOCE` o `INCAPACIDAD_ISSS`).
5.  Establecer la **Fecha de Inicio** y **Fecha de Fin** de la suspensión de labores.
6.  Describir brevemente el **Motivo** (ej. "Enfermedad común diagnosticada en ISSS Atlacatl").
7.  El estado inicial de la solicitud se guardará como `PENDIENTE`.

### Paso 2: Evaluación y Aprobación Operativa
El Administrador de Recursos Humanos tiene la facultad de revisar y validar cada registro:
1.  En la pantalla de **Gestión Operativa**, se visualizan las solicitudes en estado `PENDIENTE`.
2.  El encargado debe contrastar los datos contra los justificantes físicos o digitales entregados por el colaborador.
3.  Seleccionar la opción de **Aprobar** o **Rechazar** la incidencia.
    *   **AUSENCIA_INJUSTIFICADA:**
        *   **Aprobar:** Significa confirmar y validar que la falta es real y que no tiene justificación. Al aprobarla, el administrador de Recursos Humanos autoriza formalmente al motor de cálculo de nómina para que proceda a aplicar el descuento salarial correspondiente a los días no laborados en la planilla del período en que traslape.
        *   **Rechazar:** Significa anular el registro de la falta o desestimarla. Esto ocurre si el reporte inicial fue un error (por ejemplo, una falla en el reloj marcador de asistencia) o si el empleado presentó después una justificación válida (en cuyo caso se debe rechazar o modificar la incidencia para que no se le descuente su salario).
    *   **INCAPACIDAD_ISSS / PERMISO_GOCE:**
        *   Al **Aprobar** la incidencia, el sistema marca el período como justificado, eximiendo al colaborador de descuentos salariales por inasistencia ordinaria y, en caso de incapacidad, permitiendo el reporte correcto del subsidio ante el ISSS.

---

## 3. Guía Legal para Trámites ante el ISSS

Cuando se presenta una **INCAPACIDAD_ISSS**, se deben seguir los lineamientos de la Ley del Seguro Social y el Reglamento de Aplicación para el trámite de subsidios diarios.

### 3.1 Regla de Distribución de Pago (Incapacidad Común)
De acuerdo con la reglamentación del ISSS, el pago del subsidio por enfermedad común se distribuye de la siguiente manera:

*   **Primeros 3 días de incapacidad:** Son cubiertos por la empresa al 100% de la remuneración básica (o según políticas internas aplicables). El ISSS no subsidia los primeros tres días de suspensión laboral.
*   **A partir del 4.º día en adelante:** El ISSS cubre un subsidio diario equivalente al 75% del salario diario cotizable del trabajador.
*   **Obligación del Patrono:** El patrono suspende la obligación de pagar el salario ordinario por los días subsidiados por el ISSS (del cuarto día en adelante), a menos que exista un pacto colectivo o política corporativa para complementar el 25% restante.

### 3.2 Proceso Administrativo ante el ISSS
Para garantizar que el empleado perciba su subsidio o que la empresa lo gestione de manera óptima, se debe cumplir con el siguiente trámite:

1.  **Recepción del Certificado:** El trabajador incapacitado debe entregar a Recursos Humanos el original del **Certificado Médico de Incapacidad del ISSS** dentro de las 72 horas posteriores a la emisión del documento.
2.  **Llenado de Formulario:** Recursos Humanos debe completar el formulario de solicitud de subsidio y registrar el periodo de incapacidad en la Oficina Virtual del ISSS (sistema OVISSS).
3.  **Presentación:** Presentar el certificado junto con el reporte de salarios devengados del trabajador de los últimos tres meses anteriores al inicio de la incapacidad.
4.  **Conciliación en Planilla Mensual:** En la planilla del ISSS correspondiente, se debe reportar la novedad detallando los días en que el trabajador estuvo incapacitado. Esto justifica las diferencias entre la remuneración ordinaria reportada y los techos cotizables aplicados en ese mes.

---

## 4. Impacto Técnico en los Cálculos de Planilla

*   **Descuento diario por ausencias:** Se calcula como:
    $$\text{Descuento} = \text{Días de Ausencia Aprobados} \times \left(\frac{\text{Salario Base}}{30}\right)$$
*   **Traslape con el Período:** El servicio de nómina (`v2_payrollService.js`) calcula automáticamente el traslape en días entre el período de planilla (quincenal o mensual) y las fechas de vigencia de la ausencia aprobada.
*   **Incapacidades:** No generan deducciones por inasistencia injustificada en el sistema. Los días de incapacidad se registran en los reportes operativos de control de tiempos para las auditorías del Ministerio de Trabajo e ISSS.
