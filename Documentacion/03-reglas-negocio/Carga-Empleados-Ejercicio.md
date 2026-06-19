# Script de Carga de Empleados del Ejercicio (Planilla Diciembre 2025)

Este documento contiene el script de base de datos SQL para cargar los departamentos, cargos y empleados especificados en el ejercicio práctico de la planilla de Diciembre 2025.

El diseño del script utiliza subconsultas dinámicas para recuperar los identificadores (IDs) autoincrementales, asegurando su correcto funcionamiento sin importar si existen registros previos en las tablas.

---

## 1. Script SQL de Carga

Copie y ejecute las siguientes instrucciones en su gestor de base de datos (MariaDB/MySQL) o a través de la interfaz de phpMyAdmin:

```sql
-- Usar la base de datos del proyecto
USE comsertel_rh;

-- ========================================================
-- 0. LIMPIEZA PREVIA PARA EVITAR CONFLICTOS
-- ========================================================
-- Desactivar temporalmente restricciones de llave foranea para vaciar las tablas
SET FOREIGN_KEY_CHECKS = 0;

-- Vaciar las tablas usando DELETE FROM (permitido con FOREIGN_KEY_CHECKS = 0)
DELETE FROM boletas_pago;
DELETE FROM ausencias_incapacidades;
DELETE FROM empleados;
DELETE FROM cargos;
DELETE FROM rh_departamentos;

-- Reiniciar contadores autoincrementales
ALTER TABLE boletas_pago AUTO_INCREMENT = 1;
ALTER TABLE ausencias_incapacidades AUTO_INCREMENT = 1;
ALTER TABLE empleados AUTO_INCREMENT = 1;
ALTER TABLE cargos AUTO_INCREMENT = 1;
ALTER TABLE rh_departamentos AUTO_INCREMENT = 1;

-- Reactivar restricciones de llave foranea
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- 1. INSERTAR DEPARTAMENTOS ORGANIZACIONALES
-- ========================================================
INSERT INTO rh_departamentos (nombre, descripcion) VALUES
('Gerencia', 'Direccion y administracion general de TI'),
('Administrativo', 'Soporte operativo, logistica y administracion interna'),
('Operaciones', 'Supervision y soporte tecnico de infraestructura y campo')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- ========================================================
-- 2. INSERTAR CARGOS ASOCIADOS A LOS DEPARTAMENTOS
-- ========================================================
-- Gerencia
INSERT INTO cargos (titulo, salario_base, id_departamento) VALUES
('Gerente de TI', 1350.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Gerencia' LIMIT 1));

-- Administrativo
INSERT INTO cargos (titulo, salario_base, id_departamento) VALUES
('Asistente de gerencia', 700.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Administrativo' LIMIT 1)),
('Soporte de redes y HW', 700.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Administrativo' LIMIT 1)),
('Encargado de almacenaje y seguridad de la informacion', 700.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Administrativo' LIMIT 1));

-- Operaciones
INSERT INTO cargos (titulo, salario_base, id_departamento) VALUES
('Supervisor de occidente', 750.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Operaciones' LIMIT 1)),
('Supervisor de oriente', 750.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Operaciones' LIMIT 1)),
('Supervisor centro', 750.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Operaciones' LIMIT 1)),
('Tecnico de soporte a domicilio-Occidente', 600.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Operaciones' LIMIT 1)),
('Tecnico de soporte a domicilio-Oriente', 600.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Operaciones' LIMIT 1)),
('Tecnico de soportea domicilio-Central', 600.00, (SELECT id FROM rh_departamentos WHERE nombre = 'Operaciones' LIMIT 1));


-- ========================================================
-- 3. INSERTAR COLABORADORES (EMPLEADOS)
-- ========================================================
-- Empleado 1: Gerencia
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000001-1', '0614-011212-101-1', 'Jose Alexander', 'Guardado Martinez', '2012-12-01', 
 (SELECT id FROM cargos WHERE titulo = 'Gerente de TI' LIMIT 1), 'ACTIVO');

-- Empleado 2: Administrativo - Asistente de gerencia
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000002-2', '0614-250818-102-2', 'Elena Maria', 'Rivas Fuentes', '2018-08-25', 
 (SELECT id FROM cargos WHERE titulo = 'Asistente de gerencia' LIMIT 1), 'ACTIVO');

-- Empleado 3: Administrativo - Soporte de redes
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000003-3', '0614-021219-103-3', 'Carlos Eduardo', 'Alvarado Perez', '2019-12-02', 
 (SELECT id FROM cargos WHERE titulo = 'Soporte de redes y HW' LIMIT 1), 'ACTIVO');

-- Empleado 4: Administrativo - Encargado de almacenaje
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000004-4', '0614-111120-104-4', 'Ana Beatrize', 'Gomez Villalta', '2020-11-11', 
 (SELECT id FROM cargos WHERE titulo = 'Encargado de almacenaje y seguridad de la informacion' LIMIT 1), 'ACTIVO');

-- Empleado 5: Operaciones - Supervisor Occidente
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000005-5', '0614-060717-105-5', 'Roberto Carlos', 'Sosa Maldonado', '2017-07-06', 
 (SELECT id FROM cargos WHERE titulo = 'Supervisor de occidente' LIMIT 1), 'ACTIVO');

-- Empleado 6: Operaciones - Supervisor Oriente
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000006-6', '0614-070320-106-6', 'Mauricio Ernesto', 'Portillo Luna', '2020-03-07', 
 (SELECT id FROM cargos WHERE titulo = 'Supervisor de oriente' LIMIT 1), 'ACTIVO');

-- Empleado 7: Operaciones - Supervisor Centro
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000007-7', '0614-081219-107-7', 'Gabriela Sofia', 'Zamora Castro', '2019-12-08', 
 (SELECT id FROM cargos WHERE titulo = 'Supervisor centro' LIMIT 1), 'ACTIVO');

-- Empleado 8: Operaciones - Tecnico Soporte Occidente
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000008-8', '0614-090716-108-8', 'William Orlando', 'Mejia Ramos', '2016-07-09', 
 (SELECT id FROM cargos WHERE titulo = 'Tecnico de soporte a domicilio-Occidente' LIMIT 1), 'ACTIVO');

-- Empleado 9: Operaciones - Tecnico Soporte Oriente
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000009-9', '0614-011215-109-9', 'Francisco Alberto', 'Pineda Ortiz', '2015-12-01', 
 (SELECT id FROM cargos WHERE titulo = 'Tecnico de soporte a domicilio-Oriente' LIMIT 1), 'ACTIVO');

-- Empleado 10: Operaciones - Tecnico Soporte Central
INSERT INTO empleados (dui, nit, nombres, apellidos, fecha_ingreso, id_cargo, estado) VALUES
('00000010-0', '0614-011223-110-0', 'David Antonio', 'Vasquez Cerna', '2023-12-01', 
 (SELECT id FROM cargos WHERE titulo = 'Tecnico de soportea domicilio-Central' LIMIT 1), 'ACTIVO');
```

---

## 2. Resumen de Colaboradores Cargados

| N° | Nombres y Apellidos | Area (Departamento) | Puesto (Cargo) | Fecha de Ingreso | Salario Base |
| :---: | :--- | :---: | :--- | :---: | :---: |
| 1 | Jose Alexander Guardado Martinez | Gerencia | Gerente de TI | 01/12/2012 | $1,350.00 |
| 2 | Elena Maria Rivas Fuentes | Administrativo | Asistente de gerencia | 25/08/2018 | $700.00 |
| 3 | Carlos Eduardo Alvarado Perez | Administrativo | Soporte de redes y HW | 02/12/2019 | $700.00 |
| 4 | Ana Beatrize Gomez Villalta | Administrativo | Encargado de almacenaje y seg. | 11/11/2020 | $700.00 |
| 5 | Roberto Carlos Sosa Maldonado | Operaciones | Supervisor de occidente | 06/07/2017 | $750.00 |
| 6 | Mauricio Ernesto Portillo Luna | Operaciones | Supervisor de oriente | 07/03/2020 | $750.00 |
| 7 | Gabriela Sofia Zamora Castro | Operaciones | Supervisor centro | 08/12/2019 | $750.00 |
| 8 | William Orlando Mejia Ramos | Operaciones | Tecnico de soporte Occidente | 09/07/2016 | $600.00 |
| 9 | Francisco Alberto Pineda Ortiz | Operaciones | Tecnico de soporte Oriente | 01/12/2015 | $600.00 |
| 10 | David Antonio Vasquez Cerna | Operaciones | Tecnico de soporte Central | 01/12/2023 | $600.00 |

---

## 3. Guia de Ejecucion del Script

### Metodo A: Usando la CLI de Docker (Recomendado)
Si su base de datos corre dentro del contenedor del Docker Compose, ejecute el siguiente comando desde la terminal del sistema (directorio raiz del proyecto) para sembrar los datos:
```bash
docker exec -i comsertel_proyec mysql -u bladimir\ 10 -pdblaster64 comsertel_rh < Documentacion/03-reglas-negocio/Carga-Empleados-Ejercicio.md
```
*(Nota: El comando lee el bloque de codigo SQL embebido directamente del documento markdown)*.

### Metodo B: Copiar y Pegar en phpMyAdmin
1. Abra su navegador e ingrese a phpMyAdmin (usualmente en `http://localhost:8080`).
2. Seleccione la base de datos `comsertel_rh` en la barra lateral izquierda.
3. Dirijase a la pestaña **SQL** en el menu superior.
4. Pegue el contenido del script SQL de la seccion 1.
5. Presione el boton **Continuar** (Go) para ejecutar la insercion de datos.
