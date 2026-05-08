# Nuevo Modelo de Base de Datos: comsertel_rh

Este documento detalla el esquema de base de datos que se utilizará para adaptar el proyecto a un sistema de control de planillas profesional, cumpliendo con las normas de normalización (1NF, 2NF, 3NF).

## 1. Justificación de Normalización

El nuevo diseño busca:
- **1NF:** Eliminar grupos repetitivos y asegurar atomicidad.
- **2NF:** Eliminar dependencias parciales (todos los campos dependen de la PK).
- **3NF:** Eliminar dependencias transitivas (especialmente entre cargos, departamentos y salarios).

## 2. Esquema SQL (MariaDB)

```sql
-- Base de Datos para Sistema de Planillas COMSERTEL
-- Cumple con 1FN, 2FN y 3FN

CREATE DATABASE IF NOT EXISTS comsertel_rh;
USE comsertel_rh;

-- 1. Tabla de Departamentos (Evita redundancia en Empleados)
CREATE TABLE departamentos (
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
   FOREIGN KEY (id_departamento) REFERENCES departamentos(id)
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
   -- Total a pagar
   salario_neto DECIMAL(10, 2) NOT NULL,
   -- Costeo Patronal (Obligaciones de la empresa)
   isss_patrono DECIMAL(10, 2) NOT NULL,
   afp_patrono DECIMAL(10, 2) NOT NULL,
   insaforp_patrono DECIMAL(10, 2) NOT NULL,
   FOREIGN KEY (id_planilla) REFERENCES planillas(id),
   FOREIGN KEY (id_empleado) REFERENCES empleados(id),
   UNIQUE(id_planilla, id_empleado) -- Un empleado tiene solo una boleta por planilla
);

-- DATOS DE PRUEBA INICIALES
INSERT INTO departamentos (nombre) VALUES ('Ventas en Campo'), ('Back Office'), ('Operaciones Técnicas');
INSERT INTO cargos (titulo, salario_base, id_departamento) VALUES ('Vendedor Toque en Frío', 365.00, 1), ('Técnico de Instalación', 450.00, 3), ('Jefe Operativo', 800.00, 2);
```

## 3. Lógica de Negocio Aplicada (Leyes de El Salvador)

Para la implementación de los cálculos en el código, se deben considerar las siguientes tasas actuales:

| Concepto | Tasa Empleado | Tasa Patrono |
| :--- | :--- | :--- |
| **ISSS** | 3.00% | 7.50% |
| **AFP** | 7.25% | 8.75% |
| **INSAFORP** | N/A | 1.00% |
| **Renta** | Según Tabla de Retención (Tramos) | N/A |

## 5. Estrategia de Migración (Base Vieja -> Nuevo Modelo)

Para realizar la transición de la base de datos vieja (**`comsertel.sql`** / esquema `workshop`) al nuevo esquema profesional de planillas (**`Nueva-base.txt`** / esquema `comsertel_rh`), se recomienda seguir estos pasos para evitar fallos catastróficos.

### Fase 1: Coexistencia y Limpieza (Backend)
1.  **Doble Configuración:** Mantener temporalmente el acceso a la base `workshop` si es necesario para migrar datos históricos o consultar lógica previa.
2.  **Refactorización de Controladores:**
    - Los controladores que usaban las tablas de `comsertel.sql` (como `articulos`, `categoria`) deben ser reemplazados por la lógica de `empleados`, `cargos` y `departamentos` de `Nueva-base.txt`.
    - **Cambio Crítico:** Las consultas ya no serán sobre una sola tabla. Se deben implementar `JOINs` para obtener la información completa (ej. Empleado + Cargo + Departamento).
3.  **Manejo de Promesas:** Cambiar el estilo de callbacks (detectado en `articulosController.js`) por `async/await` para cumplir con las nuevas buenas prácticas.

### Fase 2: Adaptación del Frontend
1.  **Modelos de Datos:** Los objetos que recibe el frontend cambiarán su estructura.
    - *Antes:* `id_articulo`, `descripcion`, `precio`.
    - *Después:* `id`, `nombres`, `apellidos`, `dui`, `cargo_titulo`, `salario_base`.
2.  **Formularios Dinámicos:** Los formularios de creación de empleados ahora deben cargar dinámicamente los "Cargos" y "Departamentos" desde la API para mantener la integridad (2NF/3NF).
3.  **Eliminación de Bootstrap:** Aprovechar el cambio de modelos para rehacer las tablas de visualización usando únicamente **Tailwind CSS**, eliminando componentes de `react-bootstrap` que causan conflictos.

### Fase 3: Lógica de Planilla (Nueva Funcionalidad)
1.  **Módulo de Cálculo:** Crear un servicio en el backend que tome los `dias_trabajados` y aplique las fórmulas legales:
    - `isss = salario * 0.03`
    - `afp = salario * 0.0725`
    - `renta = calcularRenta(salario - isss - afp)`
2.  **Validación de Ausencias:** Antes de generar una boleta, el sistema debe consultar la tabla `ausencias_incapacidades` para descontar días no remunerados.

---

## 6. Mapeo de Tablas Críticas

| Tabla Vieja (workshop) | Tabla Nueva (comsertel_rh) | Acción |
| :--- | :--- | :--- |
| `articulos` | `empleados` | Reemplazo total de lógica. |
| `categoria` | `departamentos` | Reemplazo por jerarquía de cargos. |
| `usuarios` | `usuarios` (Pendiente) | Mantener para Login, pero vincular a un `id_empleado`. |
| `clientes` | N/A | Se descarta para el sistema interno de planillas. |

**Nota de Seguridad:** Antes de ejecutar cualquier script de migración, es obligatorio realizar un respaldo (Dump) de la base de datos actual.
