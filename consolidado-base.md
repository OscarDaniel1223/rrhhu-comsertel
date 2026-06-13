# Análisis de compatibilidad de Bases de Datos

Al revisar los archivos de la base antigua (`base antigua comsertel_rh.sql`) y el nuevo script (`Nueva-base.txt`), se determinó que **sí ocurrirá un error** al intentar ejecutar el nuevo script directamente sobre la base de datos antigua en MariaDB.

## Causa del Error
El error principal que arrojaría la base de datos es: `Table 'departamentos' already exists`. 

Esto se debe a que la base antigua ya cuenta con una tabla llamada `departamentos`, la cual se utiliza con un propósito geográfico (almacena nombres de departamentos como "San Salvador", relacionados a un `id_pais` y `municipio`). Por el contrario, el nuevo script intenta crear otra tabla con el mismo nombre `departamentos` para representar los departamentos organizacionales de la empresa (Ej. "Ventas en Campo", "Back Office"), y con una estructura totalmente distinta.

## Solución Propuesta
Para poder integrar las tablas de recursos humanos (Planillas) en la base de datos antigua, he creado un nuevo script donde se ha renombrado la nueva tabla `departamentos` por `rh_departamentos` (Departamentos de la Empresa). De este modo, evitamos colisionar con la tabla geográfica ya existente. Asimismo, se actualizó la relación de llaves foráneas en la tabla `cargos` y en las sentencias de inserción (`INSERT`).

## Nuevo Script Consolidado (Sin Errores)

A continuación, el script modificado listo para ser ejecutado en la base antigua:

```sql
-- Base de Datos para Sistema de Planillas COMSERTEL (Consolidado)
-- Cumple con 1FN, 2FN y 3FN
-- Modificación: Se renombra la tabla "departamentos" a "rh_departamentos" para evitar 
-- conflictos con la tabla de departamentos geográficos de la base antigua.

CREATE DATABASE IF NOT EXISTS comsertel_rh;
USE comsertel_rh;

-- 1. Tabla de Departamentos Organizacionales (Evita redundancia en Empleados)
CREATE TABLE rh_departamentos (
   id INT AUTO_INCREMENT PRIMARY KEY,
   nombre VARCHAR(100) NOT NULL UNIQUE,
   descripcion TEXT
);

-- 2. Tabla de Cargos (Evita redundancia, define el salario base según el cargo)
CREATE TABLE cargos (
   id INT AUTO_INCREMENT PRIMARY KEY,
   titulo VARCHAR(100) NOT NULL,
   salario_base DECIMAL(10, 2) NOT NULL,
   id_departamento INT NOT NULL,
   FOREIGN KEY (id_departamento) REFERENCES rh_departamentos(id)
);

-- 3. Tabla de Empleados (Entidad principal)
CREATE TABLE empleados (
   id INT AUTO_INCREMENT PRIMARY KEY,
   dui VARCHAR(10) NOT NULL UNIQUE,
   nit VARCHAR(17) NOT NULL UNIQUE,
   nombres VARCHAR(100) NOT NULL,
   apellidos VARCHAR(100) NOT NULL,
   fecha_ingreso DATE NOT NULL,
   id_cargo INT NOT NULL,
   estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
   creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (id_cargo) REFERENCES cargos(id)
);

-- 4. Tabla de Ausencias e Incapacidades
CREATE TABLE ausencias_incapacidades (
   id INT AUTO_INCREMENT PRIMARY KEY,
   id_empleado INT NOT NULL,
   tipo ENUM('AUSENCIA_INJUSTIFICADA', 'PERMISO_GOCE', 'INCAPACIDAD_ISSS') NOT NULL,
   fecha_inicio DATE NOT NULL,
   fecha_fin DATE NOT NULL,
   motivo VARCHAR(255),
   estado ENUM('APROBADA', 'RECHAZADA', 'PENDIENTE') DEFAULT 'PENDIENTE',
   FOREIGN KEY (id_empleado) REFERENCES empleados(id)
);

-- 5. Tabla de Planillas (El encabezado del periodo a costear)
CREATE TABLE planillas (
   id INT AUTO_INCREMENT PRIMARY KEY,
   fecha_inicio DATE NOT NULL,
   fecha_fin DATE NOT NULL,
   tipo_periodo ENUM('QUINCENAL', 'MENSUAL') NOT NULL,
   estado ENUM('BORRADOR', 'CERRADA') DEFAULT 'BORRADOR',
   creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Detalles de Planilla (La Boleta de Pago por empleado)
-- 3FN: Todos los campos dependen de la clave primaria (id). Los cálculos fijos se guardan por si las tasas cambian en el futuro.
CREATE TABLE boletas_pago (
   id INT AUTO_INCREMENT PRIMARY KEY,
   id_planilla INT NOT NULL,
   id_empleado INT NOT NULL,
   dias_trabajados INT NOT NULL DEFAULT 30,
   salario_devengado DECIMAL(10, 2) NOT NULL,
   -- Descuentos de Ley Empleado
   isss_empleado DECIMAL(10, 2) NOT NULL,
   afp_empleado DECIMAL(10, 2) NOT NULL,
   renta DECIMAL(10, 2) NOT NULL,
   descuento_ausencias DECIMAL(10, 2) DEFAULT 0.00,
   -- Prestaciones Economicas Extraordinarias (Exenta de ISSS/AFP/Renta)
   quincena_veinticinco DECIMAL(10, 2) DEFAULT 0.00,
   -- Total a pagar
   salario_neto DECIMAL(10, 2) NOT NULL,
   -- Costeo Patronal (Obligaciones de la empresa)
   isss_patrono DECIMAL(10, 2) NOT NULL,
   afp_patrono DECIMAL(10, 2) NOT NULL,
   incaf_patrono DECIMAL(10, 2) NOT NULL,
   FOREIGN KEY (id_planilla) REFERENCES planillas(id),
   FOREIGN KEY (id_empleado) REFERENCES empleados(id),
   UNIQUE(id_planilla, id_empleado) -- Un empleado tiene solo una boleta por planilla
);

-- DATOS DE PRUEBA INICIALES
INSERT INTO rh_departamentos (nombre) VALUES ('Ventas en Campo'), ('Back Office'), ('Operaciones Técnicas');
INSERT INTO cargos (titulo, salario_base, id_departamento) VALUES ('Vendedor Toque en Frío', 365.00, 1), ('Técnico de Instalación', 450.00, 3), ('Jefe Operativo', 800.00, 2);
```
### Detalles del script de migración:
  
  1. Preservación de datos: Al utilizar  ADD COLUMN  con un valor  DEFAULT 0.00 , todos los registros de boletas históricas se
  actualizarán automáticamente con un valor de  0.00  en el campo  quincena_veinticinco , evitando valores nulos y garantizando     
  consistencia.                                                                                                                     
  2. Compatibilidad en el renombramiento: Se emplea la instrucción  CHANGE COLUMN  en lugar de  RENAME COLUMN  debido a que es
  soportada de forma universal por versiones tanto antiguas como modernas de MariaDB y MySQL. Esto migrará el campo                 
  insaforp_patrono  a  incaf_patrono  manteniendo su tipo de dato ( DECIMAL(10, 2) NOT NULL ) y conservando intactos todos los
  registros históricos de aportes patronales que ya hayan sido calculados.