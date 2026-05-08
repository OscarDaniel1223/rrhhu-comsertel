# Sistema de Gestión de Recursos Humanos - Comsertel RH

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-orange.svg)
![Node](https://img.shields.io/badge/Node.js->=18.0.0-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)

Sistema integral para la gestión de personal, inventarios y estadísticas de la empresa Comsertel. Diseñado para centralizar la administración de empleados, control de usuarios y visualización de datos operativos.

---

## 🚀 Tecnologías Utilizadas

### Backend
- **Entorno de ejecución:** Node.js
- **Framework:** Express.js (v5.1.0)
- **Base de Datos:** MySQL (mysql2 con promesas)
- **Seguridad:** JSON Web Tokens (JWT), BcryptJS (encriptación de contraseñas)
- **Gestión de variables:** Dotenv

### Frontend
- **Framework:** React 19 (Vite)
- **Estilos:** Tailwind CSS, Bootstrap 5
- **Gráficos:** Recharts
- **Tablas:** React Data Table Component
- **Alertas:** SweetAlert2
- **Iconos:** Bootstrap Icons

---

## 🛠️ Configuración e Instalación

### Requisitos Previos
- [Node.js](https://nodejs.org/) instalado.
- Servidor [MySQL](https://www.mysql.com/) en ejecución.

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd rrhhu-comsertel
```

### 2. Configuración del Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la carpeta `backend/` basado en `.env.example`:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=comsertel_rh
PORT=3001
JWT_SECRET=una_clave_segura_aleatoria
```
*Nota: Asegúrate de importar el script SQL incluido en el proyecto para crear la estructura de la base de datos.*

### 3. Configuración del Frontend
```bash
cd ../frontend/app-react
npm install
```

---

##  Ejecución en Desarrollo

Para ejecutar ambos servicios simultáneamente:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend/app-react
npm run dev
```

El backend correrá en `http://localhost:3001` y el frontend usualmente en `http://localhost:5173`.

---

## 📂 Estructura del Proyecto

```text
rrhhu-comsertel/
├── backend/            # API REST (Node/Express)
│   ├── config/         # Conexión a DB
│   ├── controllers/    # Lógica de negocio
│   ├── routes/         # Definición de endpoints
│   └── .env            # Variables sensibles (no subir)
├── frontend/
│   └── app-react/      # Aplicación SPA (React/Vite)
│       ├── src/
│       │   ├── components/ # Componentes reutilizables
│       │   ├── hooks/      # Hooks personalizados
│       │   ├── services/   # Llamadas al API
│       │   └── providers/  # Contextos (Auth/Theme)
└── Documentacion/      # Guías detalladas y manuales
```

---

## 📑 Documentación Adicional
Para más detalles sobre el funcionamiento interno, consulta la carpeta `Documentacion/`:
- [Nuevo Modelo de Base de Datos](./Documentacion/Nuevo-Modelo-BD.md)
- [Guía de Seguridad y JWT](./Documentacion/Guia-JWT-y-Seguridad.md)
- [Buenas Prácticas Backend](./Documentacion/Buenas-Practicas-Backend.md)
- [Buenas Prácticas Frontend](./Documentacion/Buenas-Practicas-Frontend.md)

---

## 📄 Licencia
Este proyecto está bajo la Licencia **Apache 2.0**. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---
*Desarrollado para Comsertel S.A de C.V.*
