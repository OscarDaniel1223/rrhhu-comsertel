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
