# Documentación de API - Sistema de Planillas (v2)

Esta documentación cubre los endpoints creados para la gestión de Departamentos Organizacionales y Cargos, correspondientes al **Sprint 1**. Todos los endpoints se encuentran bajo el prefijo `/api` y responden siguiendo el formato JSON estandarizado del proyecto.

## Formato de Respuestas
**Éxito:**
```json
{
  "status": "success",
  "data": { ... },
  "message": "Mensaje descriptivo"
}
```
**Error:**
```json
{
  "status": "error",
  "error": "CODIGO_ERROR",
  "message": "Descripción amigable para el usuario"
}
```

---

## 🏢 Departamentos (`rh_departamentos`)

### 1. Obtener todos los departamentos
- **Endpoint:** `GET /api/departamentos`
- **Descripción:** Retorna la lista completa de departamentos de la empresa.
- **Respuesta Exitosa:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "nombre": "Ventas en Campo",
      "descripcion": "Encargados de ventas directas"
    }
  ],
  "message": "Departamentos obtenidos exitosamente"
}
```

### 2. Obtener un departamento por ID
- **Endpoint:** `GET /api/departamentos/:id`
- **Descripción:** Retorna la información de un departamento específico.
- **Respuesta Exitosa:** `200 OK`
- **Error (No existe):** `404 Not Found`

### 3. Crear un departamento
- **Endpoint:** `POST /api/departamentos`
- **Body:**
```json
{
  "nombre": "Back Office",
  "descripcion": "Gestión interna y contable" 
}
```
- **Respuesta Exitosa:** `201 Created`
```json
{
  "status": "success",
  "data": { "id": 2 },
  "message": "Departamento creado exitosamente"
}
```

### 4. Actualizar un departamento
- **Endpoint:** `PUT /api/departamentos/:id`
- **Body:** Igual que el POST.
- **Respuesta Exitosa:** `200 OK`

### 5. Eliminar un departamento
- **Endpoint:** `DELETE /api/departamentos/:id`
- **Descripción:** Elimina un departamento. Si tiene cargos asociados, fallará por clave foránea.
- **Respuesta Exitosa:** `200 OK`

---

## 💼 Cargos (`cargos`)

### 1. Obtener todos los cargos
- **Endpoint:** `GET /api/cargos`
- **Descripción:** Retorna la lista de cargos, incluyendo mediante JOIN el nombre del departamento asociado.
- **Respuesta Exitosa:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "titulo": "Vendedor Toque en Frío",
      "salario_base": "365.00",
      "id_departamento": 1,
      "departamento": "Ventas en Campo"
    }
  ],
  "message": "Cargos obtenidos exitosamente"
}
```

### 2. Obtener un cargo por ID
- **Endpoint:** `GET /api/cargos/:id`
- **Respuesta Exitosa:** `200 OK`

### 3. Crear un cargo
- **Endpoint:** `POST /api/cargos`
- **Body:**
```json
{
  "titulo": "Técnico Instalador",
  "salario_base": 450.00,
  "id_departamento": 3
}
```
- **Respuesta Exitosa:** `201 Created`

### 4. Actualizar un cargo
- **Endpoint:** `PUT /api/cargos/:id`
- **Body:** Igual que el POST.
- **Respuesta Exitosa:** `200 OK`

### 5. Eliminar un cargo
- **Endpoint:** `DELETE /api/cargos/:id`
- **Descripción:** Elimina un cargo (fallará si tiene empleados asignados).
- **Respuesta Exitosa:** `200 OK`

### Integración en el Frontend
La gestión de estos endpoints se realiza a través de los siguientes módulos del Frontend:
* **Servicio:** [v2_cargoService.js](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/services/v2_cargoService.js) expone los métodos CRUD: `getCargos()`, `createCargo()`, `updateCargo()` y `deleteCargo()`.
* **Componente Tabla:** [V2_TablaCargo.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/V2_TablaCargo.jsx) renderiza la grilla de puestos y gestiona búsquedas y eliminaciones.
* **Componente Formulario:** [V2_FormularioCargo.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/V2_FormularioCargo.jsx) procesa el ingreso y modificación de puestos organizacionales.
* **Contenedor Principal:** [V2_ContenedorCargo.jsx](file:///home/bladimir/Documentos/02%20PROYECTOS/Proyecto%20RHU/rrhhu-comsertel/frontend/app-react/src/components/V2_ContenedorCargo.jsx) agrupa la tabla y el formulario en una interfaz unificada mediante pestañas de navegación fluida.

---

## Ausencias e Incapacidades (`ausencias_incapacidades`)

### 1. Obtener todas las ausencias e incapacidades
- **Endpoint:** `GET /api/ausencias-incapacidades`
- **Descripción:** Retorna la lista completa de ausencias e incapacidades con los datos básicos del empleado. Soporta un parámetro de consulta opcional `id_empleado` para filtrar por empleado.
- **Respuesta Exitosa:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "id_empleado": 3,
      "tipo": "INCAPACIDAD_ISSS",
      "fecha_inicio": "2026-06-10",
      "fecha_fin": "2026-06-12",
      "motivo": "Reposo por salud",
      "estado": "APROBADA",
      "empleado_nombres": "Juan Carlos",
      "empleado_apellidos": "Perez Gomez",
      "empleado_dui": "01234567-8"
    }
  ],
  "message": "Ausencias e incapacidades obtenidas exitosamente"
}
```

### 2. Obtener una ausencia o incapacidad por ID
- **Endpoint:** `GET /api/ausencias-incapacidades/:id`
- **Respuesta Exitosa:** `200 OK`

### 3. Registrar una ausencia o incapacidad
- **Endpoint:** `POST /api/ausencias-incapacidades`
- **Body:**
```json
{
  "id_empleado": 3,
  "tipo": "AUSENCIA_INJUSTIFICADA",
  "fecha_inicio": "2026-06-15",
  "fecha_fin": "2026-06-15",
  "motivo": "Inasistencia sin justificacion",
  "estado": "PENDIENTE"
}
```
- **Respuesta Exitosa:** `201 Created`
```json
{
  "status": "success",
  "data": { "id": 4 },
  "message": "Ausencia o incapacidad registrada exitosamente"
}
```

### 4. Actualizar una ausencia o incapacidad
- **Endpoint:** `PUT /api/ausencias-incapacidades/:id`
- **Body:** Todos los campos son obligatorios para actualizar.
- **Respuesta Exitosa:** `200 OK`

### 5. Eliminar un registro de ausencia o incapacidad
- **Endpoint:** `DELETE /api/ausencias-incapacidades/:id`
- **Respuesta Exitosa:** `200 OK`

---

## Planillas (planillas) y Boletas de Pago (boletas_pago)

### 1. Obtener todas las planillas
- **Endpoint:** `GET /api/planillas`
- **Descripción:** Retorna el listado completo de planillas registradas, ordenadas por fecha de creación descendente.
- **Respuesta Exitosa:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "fecha_inicio": "2026-06-01",
      "fecha_fin": "2026-06-15",
      "tipo_periodo": "QUINCENAL",
      "estado": "BORRADOR",
      "creado_en": "2026-06-13T16:00:00.000Z"
    }
  ],
  "message": "Planillas obtenidas exitosamente"
}
```

### 2. Obtener detalle de planilla por ID (Consolidado y Boletas)
- **Endpoint:** `GET /api/planillas/:id`
- **Descripción:** Retorna la información de la planilla, un resumen consolidado de costos (costeo patronal y retenciones agregadas) y el listado de las boletas de pago generadas para cada empleado.
- **Respuesta Exitosa:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "planilla": {
      "id": 1,
      "fecha_inicio": "2026-06-01",
      "fecha_fin": "2026-06-15",
      "tipo_periodo": "QUINCENAL",
      "estado": "BORRADOR",
      "creado_en": "2026-06-13T16:00:00.000Z"
    },
    "resumen": {
      "total_salarios_devengados": 1200.50,
      "total_isss_empleado": 30.00,
      "total_afp_empleado": 87.04,
      "total_renta": 15.00,
      "total_salarios_netos": 1068.46,
      "total_isss_patrono": 75.00,
      "total_afp_patrono": 105.04,
      "total_insaforp_patrono": 10.00,
      "total_aportes_patronales": 190.04,
      "total_costo_patronal": 1390.54,
      "total_beneficios": 50.00,
      "total_vacaciones": 0.00,
      "total_aguinaldo": 0.00,
      "total_quincena_veinticinco": 0.00
    },
    "boletas": [
      {
        "id": 1,
        "id_planilla": 1,
        "id_empleado": 3,
        "dias_trabajados": 15,
        "salario_devengado": "600.00",
        "isss_empleado": "18.00",
        "afp_empleado": "43.50",
        "renta": "0.00",
        "salario_neto": "538.50",
        "isss_patrono": "45.00",
        "afp_patrono": "52.50",
        "insaforp_patrono": "6.00",
        "beneficios": "0.00",
        "vacaciones": "0.00",
        "aguinaldo": "0.00",
        "quincena_veinticinco": "0.00",
        "nombres": "Juan Carlos",
        "apellidos": "Perez Gomez",
        "dui": "01234567-8",
        "nit": "0614-101090-101-1",
        "cargo": "Técnico Instalador",
        "salario_base": "1200.00"
      }
    ]
  },
  "message": "Detalle de planilla obtenido exitosamente"
}
```

### 3. Generar Planilla
- **Endpoint:** `POST /api/planillas`
- **Descripción:** Crea un registro de planilla e inicia el procesamiento y cálculo de nómina masivo de todos los empleados en estado ACTIVO para el rango de fechas y período configurado. Registra las deducciones previsionales (AFP, ISSS, Renta 2025) y los aportes patronales (ISSS 7.5%, AFP 8.75%, INCAF 1%), guardando la información en boletas_pago. Permite pasar un arreglo opcional de novedades (beneficios, vacaciones, viáticos, horas extras diurnas y horas extras nocturnas) por empleado.
- **Body:**
```json
{
  "fecha_inicio": "2026-06-01",
  "fecha_fin": "2026-06-15",
  "tipo_periodo": "QUINCENAL",
  "novedades": [
    {
      "id_empleado": 3,
      "beneficios": 50.00,
      "vacaciones": 0.00,
      "viaticos": 100.00,
      "horas_extras_diurnas": 45.00,
      "horas_extras_nocturnas": 25.00
    }
  ]
}
```
- **Respuesta Exitosa:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "id_planilla": 1,
    "boletas_generadas": 10
  },
  "message": "Planilla generada y procesada exitosamente."
}
```

### 4. Cerrar Planilla
- **Endpoint:** `PUT /api/planillas/:id/cerrar`
- **Descripción:** Modifica el estado de la planilla seleccionada a CERRADA. Una planilla cerrada es definitiva y no puede ser recalculada o eliminada.
- **Respuesta Exitosa:** `200 OK`
```json
{
  "status": "success",
  "message": "Planilla cerrada exitosamente"
}
```

### 5. Eliminar Planilla
- **Endpoint:** `DELETE /api/planillas/:id`
- **Descripción:** Elimina una planilla y todas sus boletas de pago asociadas (en cascada). Solo es permitido para planillas en estado BORRADOR.
- **Respuesta Exitosa:** `200 OK`
```json
{
  "status": "success",
  "message": "Planilla y boletas de pago asociadas eliminadas exitosamente"
}
```

## Novedades de Empleados (Horas Extras, Viaticos y Beneficios)

### 1. Obtener novedades diarias o consolidadas
- **Endpoint:** `GET /api/novedades`
- **Descripción:** Retorna la lista de novedades registradas para un dia especifico o las sumas acumuladas por empleado en un rango de fechas.
- **Query Parameters (Caso A - Consulta Diaria):**
  * `fecha` (string YYYY-MM-DD, requerido): Fecha exacta a consultar.
- **Query Parameters (Caso B - Consolidado de Planilla):**
  * `fecha_inicio` (string YYYY-MM-DD, requerido): Fecha de inicio del periodo.
  * `fecha_fin` (string YYYY-MM-DD, requerido): Fecha de fin del periodo.
- **Respuesta Exitosa (Caso A):** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "id_empleado": 3,
      "fecha": "2026-06-24",
      "horas_extras_diurnas": "2.50",
      "horas_extras_nocturnas": "1.00",
      "viaticos": "10.00",
      "beneficios": "50.00",
      "nombres": "Juan",
      "apellidos": "Perez",
      "salario_base": "450.00"
    }
  ],
  "message": "Novedades diarias obtenidas exitosamente"
}
```

### 2. Guardar o actualizar novedades diarias
- **Endpoint:** `POST /api/novedades`
- **Descripción:** Registra o actualiza en bloque las novedades de multiples empleados para una fecha dada.
- **Body:**
```json
{
  "fecha": "2026-06-24",
  "novedades": [
    {
      "id_empleado": 3,
      "horas_extras_diurnas": 2.50,
      "horas_extras_nocturnas": 1.00,
      "viaticos": 10.00,
      "beneficios": 50.00
    }
  ]
}
```
- **Respuesta Exitosa:** `200 OK`
```json
{
  "status": "success",
  "message": "Novedades del dia guardadas exitosamente"
}
```


