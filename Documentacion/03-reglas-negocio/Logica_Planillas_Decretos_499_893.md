# **Lógica de Negocio para Sistema de Planillas (Nómina)**

**Documentos de referencia:** Decreto No. 499 (Quincena Veinticinco) y Decreto N.° 893 (Ley INCAF).

## **1\. Módulo: "Quincena Veinticinco" (Decreto No. 499\)**

Esta es una **nueva prestación económica anual** que debe integrarse al sistema de nóminas.

### **Parámetros de Cálculo**

* **Condición de Salario Máximo:** Solo aplica para empleados con un salario básico o nominal mensual **menor o igual a $1,500.00 USD**.  
  * *Lógica:* IF salario\_nominal \<= 1500.00 THEN aplica\_bono \= TRUE  
* **Monto a Pagar:** Corresponde exactamente al **50% del salario básico o nominal mensual** que el empleado perciba al momento del pago.  
  * *Fórmula:* monto\_quincena\_25 \= salario\_nominal \* 0.50

### **Reglas de Retenciones y Deducciones (¡MUY IMPORTANTE\!)**

* El monto a pagar **NO está sujeto a ningún tipo de retención ni descuento**.  
* **AFP (Pensiones):** Exento (0%).  
* **ISSS (Salud):** Exento (0%).  
* **ISR (Impuesto sobre la Renta):** Renta no gravable (Exento). No sumar a la base imponible del mes.  
* **Embargos:** Goza de inembargabilidad (no aplicar descuentos por embargos judiciales o de procuraduría sobre este rubro específico).  
* **Cálculo de otras prestaciones:** Este monto NO forma parte de la base de cálculo para aguinaldos, indemnizaciones ni vacaciones.

### **Fechas de Ejecución (Trigger)**

* **Período de pago:** Debe programarse para pagarse entre el **15 y el 25 de enero** de cada año.  
* **Vigencia en Sector Privado:** \* Año 2026: **Voluntario** (El sistema debe permitir activar/desactivar el cálculo por empresa). *Nota: Si se paga, genera un crédito fiscal para la empresa.*  
  * Año 2027 en adelante: **Obligatorio** (Hardcoded/Automático).  
* **Vigencia en Sector Público/Municipal:** Obligatorio desde 2026\.

### **Reglas de Elegibilidad y Terminación de Contrato**

* **Requisitos:** Los mismos que la lógica actual del sistema para el cálculo del Aguinaldo (Ley sobre la Compensación Adicional en Efectivo).  
* **Finiquitos/Liquidaciones:** Si un empleado es despedido sin causa justa antes del 25 de enero, el sistema debe calcular la parte proporcional (o completa, según aplique) usando las mismas reglas matemáticas que la proporcionalidad del Aguinaldo.

## **2\. Módulo: Aportación Patronal "INCAF" (Decreto N.° 893\)**

Esta ley disuelve el INSAFORP y crea el INCAF. Para efectos de sistema, **es un cambio de nombre y mantenimiento de la lógica de la aportación patronal actual**.

### **Reglas de Cálculo (Aportación Patronal)**

* **Naturaleza:** Es un impuesto **exclusivo del patrono**.  
  * *Regla estricta:* descuento\_empleado \= 0.00 (En ningún caso afectará el salario del trabajador).  
* **Condición de Empresa (Umbral):** Aplica solo a patronos del sector privado e Instituciones Oficiales Autónomas que empleen a **10 o más trabajadores**.  
* **Tasa General:** **1%** calculado sobre el monto total de las planillas mensuales de sueldos y salarios.  
* **Excepción Sector Agropecuario:** \* Tasa: **0.25%** (1/4 del 1%).  
  * Base: Solo sobre planillas de salarios de trabajadores **permanentes** (exento para trabajadores temporales agrícolas).

### **Notas de Implementación (Backend/Planilla ISSS)**

* **Mecanismo de Recaudación:** El sistema de recaudación sigue siendo a través del Instituto Salvadoreño del Seguro Social (ISSS).  
* **Acción para el Dev:** Si el sistema actual ya calcula la cuota patronal de "INSAFORP" al 1%, la lógica matemática no cambia, únicamente se debe **refactorizar el nombre de la variable/etiqueta en la base de datos y reportes de "INSAFORP" a "INCAF"**.

### **📋 Check-list rápido para el Desarrollador:**

* \[ \] Crear nuevo concepto de ingresos (Earnings): Quincena\_Veinticinco.  
* \[ \] Configurar Quincena\_Veinticinco para que excluya deducciones de Renta, ISSS, AFP y Embargos.  
* \[ \] Crear flag/condicional que evalúe si salario\_nominal \<= 1500 antes de calcular el 50% en enero.  
* \[ \] Añadir lógica de proporcionalidad a los finiquitos (liquidaciones) para despidos en enero.  
* \[ \] Renombrar el concepto de aportación patronal (Employer Taxes) INSAFORP a INCAF.  
* \[ \] Verificar que la lógica del INCAF solo aplique a empresas con empleados \>= 10\.