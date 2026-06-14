# Indice General de Documentacion

Este directorio contiene toda la documentacion tecnica, funcional y operativa del proyecto. Los archivos estan organizados en categorias especificas para facilitar su mantenimiento y consulta.

## Estructura y Navegacion

### 1. General
Informacion introductoria sobre el proyecto y planeacion de desarrollo.
* [Sobre este proyecto](01-general/Sobre-este-proyecto.md): Contexto macro, objetivos y alcance del sistema.
* [Sprint](01-general/Sprint.md): Seguimiento de metas y tareas del ciclo de desarrollo actual.

### 2. Desarrollo y Arquitectura
Estandares de codificacion, diseno del sistema y especificaciones de componentes tecnicos.
* [API](02-desarrollo-arquitectura/API.md): Especificacion detallada de los endpoints del backend.
* [Buenas Practicas Backend](02-desarrollo-arquitectura/Buenas-Practicas-Backend.md): Estandares, patrones y estructura de codigo de servidor.
* [Buenas Practicas Frontend](02-desarrollo-arquitectura/Buenas-Practicas-Frontend.md): Convenciones y pautas para el desarrollo de la interfaz de usuario.
* [Guia JWT y Seguridad](02-desarrollo-arquitectura/Guia-JWT-y-Seguridad.md): Protocolos de autenticacion, autorizacion y resguardo de datos.
* [Nuevo Modelo BD](02-desarrollo-arquitectura/Nuevo-Modelo-BD.md): Diagramas y diseno de la base de datos relacional.
* [Solucion Fechas Invalidas](02-desarrollo-arquitectura/Solucion-Fechas-Invalidas.md): Analisis y arreglo de problemas de fechas locales en el listado de planillas.
* [Solucion Error Generar Planilla](02-desarrollo-arquitectura/Solucion-Error-Generar-Planilla.md): Diagnostico y solucion al error HTTP 500 al generar planilla y boletas.

### 3. Reglas de Negocio y Logica Fiscal/Laboral
Documentos legales, matematicos y de formulacion que describen el calculo de planillas y prestaciones.
* [Calculos Nomina Prestaciones](03-reglas-negocio/Calculos-Nomina-Prestaciones.md): Criterios de liquidacion, horas extra y pagos salariales.
* [Investigacion R](03-reglas-negocio/Investigacion-R.md): Modelos de simulacion o analisis numerico de la nomina.
* [Logica de Planillas (Decretos 499 y 893)](03-reglas-negocio/Logica_Planillas_Decretos_499_893.md): Criterios especiales de retencion segun decretos estatales.
* [Manual Incapacidades ISSS](03-reglas-negocio/Manual-Incapacidades-ISSS.md): Procedimiento de pago y subsidio por incapacidades medicas del ISSS.
* [Migracion Decretos (Referencia SQL)](03-reglas-negocio/Migracion-Decretos-499-893.sql): Script de migracion de base de datos asociado a las planillas especiales.
* [Tecnica ISR 2025](03-reglas-negocio/Tecnica-ISR-2025.md): Tabla de retenciones del Impuesto Sobre la Renta y reglas aplicables.

### 4. Guias de Usuario y Procesos Operativos
Manuales de usuario y procesos de administracion interna.
* [Guia Creacion Usuarios](04-guias-usuario/Guia-Creacion-Usuarios.md): Pasos para el registro y asignacion de roles a usuarios en la plataforma.
