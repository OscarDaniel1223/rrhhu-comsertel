# Manual de Usuario y Guia del Sistema de Planillas COMSERTEL

Este manual proporciona una guia detallada e instrucciones paso a paso para la utilizacion y operacion del Sistema de Recursos Humanos y Nomina de COMSERTEL. El software ha sido diseñado para gestionar de forma integral el personal, las incidencias de asistencia y el computo de salarios con estricto apego a las leyes laborales de El Salvador.

---

## 1. Beneficios de Contar con el Aplicativo

La automatizacion del calculo de planillas a traves de este software ofrece las siguientes ventajas estrategicas para COMSERTEL:

* **Eliminacion de Errores Manuales:** El motor de calculo procesa de forma automatica retenciones complejas (AFP, ISSS, Impuesto sobre la Renta) y deducciones especiales (como la deduccion fija del Tramo II), mitigando multas y glosas por calculos incorrectos.
* **Cumplimiento Legal Garantizado:** Las actualizaciones correspondientes a las reformas recientes (como el Decreto N. 499 de la Quincena Veinticinco y el Decreto N. 893 del INCAF) estan integradas directamente en el backend del sistema.
* **Seguridad y Auditoria:** La segregacion de roles de usuario (Administrador y Visualizador) evita la alteracion no autorizada de salarios base o periodos financieros ya cerrados.
* **Eficiencia Operativa:** Reduce el tiempo de procesamiento de la nomina de dias a minutos, consolidando ausencias aprobadas y novedades en un unico flujo de generacion.

---

## 2. Inicio de Sesion (Autenticacion)

Para acceder al sistema:
1. Abra el navegador web e ingrese a la direccion local de la aplicacion.
2. En la pantalla de inicio de sesion, digite su nombre de usuario (o correo electronico) y contraseña.
3. Haga clic en el boton **Iniciar Sesion**.
4. Si las credenciales son correctas, el sistema lo redireccionara al Dashboard Principal. En caso contrario, vera un mensaje de error indicando datos de acceso incorrectos.

*Nota: Para cerrar la sesion de manera segura, haga clic en el nombre de su usuario en la esquina superior derecha y seleccione la opcion "Cerrar Sesion".*

---

## 3. Navegacion por los Modulos del Sistema

La aplicacion posee una barra de navegacion lateral o superior para acceder a los siguientes apartados:

### 3.1 Dashboard de Estadisticas (Modulo Principal)
Presenta un resumen grafico de la situacion actual de la empresa:
* **Tarjetas Informativas:** Muestran el numero de empleados activos, el total del costo de nomina en el ultimo periodo cerrado, la provision de seguridad social y los fondos destinados a prestaciones.
* **Graficos de Distribucion:** Visualizan la distribucion del personal por departamento y cargos.
* **Monitoreo Financiero:** Grafica la evolucion mensual de los costos de planilla de la empresa.

### 3.2 Gestion de Empleados
Permite administrar la base de datos de los colaboradores de COMSERTEL:
* **Visualizar Lista:** Muestra la lista de empleados con sus nombres, apellidos, DUI, cargo, departamento y estado (Activo/Inactivo).
* **Registrar Nuevo Empleado:**
  1. Haga clic en el boton **Nuevo Empleado**.
  2. Complete el formulario con la informacion solicitada: nombres, apellidos, DUI (con guion, ej. 00000000-0), NIT, fecha de ingreso y seleccione el cargo correspondiente.
  3. Haga clic en **Guardar**. El sistema asignara automaticamente el departamento en base al cargo seleccionado.
* **Editar Empleado:** Haga clic en el icono de lapiz al lado del registro del empleado para actualizar su informacion basica o puesto de trabajo.
* **Activar/Desactivar:** Puede alternar el estado del empleado. Los empleados marcados como "Inactivos" no seran incluidos en las planillas generadas despues de su fecha de baja.

### 3.3 Gestion de Ausencias e Incapacidades
Modulo critico para registrar las incidencias de asistencia que afectan el pago del salario base:
* **Registrar Incidencia:**
  1. Seleccione al empleado en la lista desplegable.
  2. Elija el tipo de incidencia:
     * *Ausencia Injustificada:* Descuenta la parte proporcional diaria del salario devengado.
     * *Permiso con Goce:* Justificado, no genera descuento de salario.
     * *Incapacidad ISSS:* Permiso medico justificado por el Seguro Social.
  3. Establezca las fechas de inicio y fin de la ausencia.
  4. Detalle el motivo de la incidencia.
  5. Haga clic en **Registrar**.
* **Aprobacion de Ausencias:** Las ausencias del tipo "Ausencia Injustificada" deben ser revisadas y marcadas como **Aprobadas** por un administrador para que el sistema efectue de forma automatica el descuento economico al generar la planilla del periodo respectivo.

### 3.4 Gestion de Cargos y Departamentos
Establece los puestos y la escala salarial de la empresa:
* **Validacion de Salario Minimo:** Al crear o modificar un cargo, el sistema requiere obligatoriamente que el **salario base** asignado sea mayor o igual al salario minimo legal de **$365.00 USD**. Si intenta ingresar un valor menor (ej. $300.00 USD), el sistema bloqueara la operacion y mostrara una alerta de violacion a las reglas de negocio.
* **Crear Cargo:** Ingrese el titulo del puesto, el salario base respectivo y asocie el departamento correspondiente.

---
## 4. Generacion y Procesamiento de Planillas

Este es el proceso central del sistema. Siga estos pasos detallados para computar los salarios de la plantilla:

### Paso 1: Seleccion de Periodo
1. Dirijase al modulo de **Planillas**.
2. Haga clic en el boton **Generar Planilla**.
3. Seleccione el **Mes Actual** que desea calcular. Las fechas de inicio y fin, asi como el tipo de periodo, se configuran de manera automatica en el sistema para reducir errores operativos de digitacion.

### Paso 2: Parametrizacion Especial de Prestaciones (Aguinaldo y Quincena Veinticinco)
El sistema evalua de forma automatica el periodo ingresado y activa los siguientes calculos segun corresponda:
* **Calculo del Aguinaldo**:
  * Si la fecha de fin de la planilla se encuentra dentro del rango del **20 de octubre al 20 de diciembre** de cualquier año, el sistema activara automaticamente el calculo del aguinaldo anual.
  * El sistema evaluara la antiguedad de cada colaborador y computara el monto que corresponde por ley (completo o proporcional si tiene menos de un año de laborar).
* **Switch de la Quincena Veinticinco (Enero de 2026)**:
  * Si el mes seleccionado es **Enero de 2026**, la interfaz mostrara de forma automatica la seccion **"Aplicar Quincena Veinticinco (Voluntario 2026)"**.
  * Si la empresa decide aplicar voluntariamente el beneficio este año de transicion, deje el switch activo e ingrese la **Fecha de Pago Efectiva** (la ley exige que sea obligatoriamente entre el 15 y el 25 de enero). El sistema procesara el 50% de salario exento para aquellos empleados que devengan $1,500.00 USD o menos, calculando los salarios nominales y la antiguedad de los colaboradores vigentes a esa fecha seleccionada.
  * Si la empresa decide no aplicarlo, desactive el switch. El sistema no realizara la provision ni el pago de dicho rubro en Enero de 2026.
  * *Nota: A partir de enero del año 2027 en adelante, el beneficio se procesara con caracter obligatorio de acuerdo con el Decreto N. 499.*

### Paso 3: Registro de Novedades e Incidencias del Periodo
Antes de generar la planilla, se habilitara un listado de todos los colaboradores activos para registrar pagos adicionales u horas extraordinarias en el periodo:
* **Beneficios / Comisiones ($)**: Ingrese el monto en dolares correspondiente a bonos, comisiones o incentivos adicionales.
* **Vacaciones a Pagar**: Active la casilla de verificacion (checklist) junto al colaborador al que se le liquidara su periodo vacacional anual. El sistema calculara automaticamente el importe monetario correspondiente aplicando el **130% de la quincena de salario base** de acuerdo con la ley salvadoreña de vacaciones remuneradas (15 dias de salario mas el 30% de recargo de ley):
  $$\text{Monto Vacaciones} = \frac{\text{Salario Base Mensual}}{2} \times 1.30$$
* **Viaticos ($)**: Ingrese el monto de viaticos devengado por viajes o gastos operativos. Este rubro esta configurado como un reembolso exento de descuentos de Seguro Social (ISSS), Prevision Social (AFP) e Impuesto sobre la Renta (ISR).
* **Horas Extras Diurnas (Hrs) y Horas Extras Nocturnas (Hrs)**: Ingrese la **cantidad de horas extras** trabajadas por el colaborador (admite numeros decimales, por ejemplo, 1.5 horas). Al digitar el numero de horas, la interfaz del sistema calculara de forma automatica y en tiempo real el valor economico equivalente en dolares bajo el input, basandose en el salario base del colaborador y los recargos de ley salvadoreños:
  * *Horas Extras Diurnas*: Pago doble de la hora ordinaria diurna:
    $$\text{Monto HED} = \text{Cantidad de Horas} \times \frac{\text{Salario Base Mensual}}{120.0}$$
  * *Horas Extras Nocturnas*: Pago doble de la hora ordinaria nocturna (recargo del 25% sobre la ordinaria diurna):
    $$\text{Monto HEN} = \text{Cantidad de Horas} \times \frac{\text{Salario Base Mensual}}{96.0}$$

### Paso 4: Generacion Preliminar (Borrador)
1. Haga clic en el boton **Procesar y Generar Planilla**.
2. El sistema creara un registro en estado **Borrador**.
3. Se presentara en pantalla la tabla consolidada preliminar de todos los empleados con sus respectivos salarios devengados totales, deducciones calculadas (ISSS, AFP, Retencion de Renta), subsidios y beneficios aplicados (Quincena 25, Vacaciones, Horas Extras, Viaticos), asi como el Salario Neto Liquido a pagar de cada colaborador.
4. Si detecta algun error o requiere añadir/corregir novedades, puede volver atras, actualizar los datos de novedades de los empleados, y procesar nuevamente la planilla.

### Paso 5: Cierre Definitivo de Planilla
1. Una vez que la planilla ha sido auditada y revisada minuciosamente en la tabla "Detalle de Empleados en Planilla" y las tarjetas de resumen general, haga clic en el boton **Cerrar Planilla**.
2. El estado cambiara a **Cerrada**.
3. **Advertencia de Seguridad**: Al cerrar una planilla, los datos financieros quedan congelados de forma definitiva para efectos contables e historicos del sistema. No podra realizar modificaciones, eliminaciones ni recalculos sobre este periodo una vez que este cerrado.

---

## 5. Consulta y Visualizacion de Boletas de Pago

Una vez que la planilla ha sido generada o cerrada, los usuarios autorizados y empleados pueden consultar sus comprobantes de pago:
1. Dirijase al modulo de **Planillas** y seleccione una planilla de la lista.
2. Haga clic en la opcion **Ver Detalles** o **Boletas**.
3. Se desplegara la lista de empleados incluidos en el periodo. Haga clic en el nombre de un empleado para abrir su **Boleta de Pago**.
4. La boleta mostrara un desglose profesional dividido en:
   * **Datos Generales:** Nombre, DUI, puesto, departamento y periodo de pago.
   * **Ingresos Devengados:** Salario base proporcional, vacaciones, aguinaldo, quincena veinticinco y beneficios.
   * **Deducciones del Empleado:** Descuento por ausencias injustificadas, retencion ISSS, retencion AFP y retencion Impuesto sobre la Renta (ISR).
   * **Neto a Pagar:** El monto total a transferir al empleado.
   * **Costo Patronal (Informacion de la Empresa):** Detalla los aportes realizados por la empresa para ISSS patronal (7.50%), AFP patronal (8.75%) e INCAF patronal (1.00%).
