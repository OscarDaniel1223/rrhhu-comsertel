-- Script de Migracion de Base de Datos para COMSERTEL RH (MariaDB/MySQL)
-- Proposito: Actualizar la tabla boletas_pago en funcionamiento para cumplir con los Decretos 499 y 893.

USE comsertel_rh;

-- 1. Agregar la columna quincena_veinticinco (exenta de ISSS, AFP y Renta)
ALTER TABLE boletas_pago 
ADD COLUMN quincena_veinticinco DECIMAL(10, 2) DEFAULT 0.00 AFTER descuento_ausencias;

-- 2. Renombrar la columna de aportacion patronal de insaforp_patrono a incaf_patrono
-- Se utiliza CHANGE COLUMN para garantizar compatibilidad con cualquier version de MariaDB/MySQL.
ALTER TABLE boletas_pago 
CHANGE COLUMN insaforp_patrono incaf_patrono DECIMAL(10, 2) NOT NULL;
