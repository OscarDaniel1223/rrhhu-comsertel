# Sistema de Gestion de Recursos Humanos - Comsertel RH

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-orange.svg)
![Node](https://img.shields.io/badge/Node.js->=18.0.0-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)

Sistema integral para la gestion de personal, inventarios y estadisticas de la empresa Comsertel. Disenado para centralizar la administracion de empleados, control de usuarios y visualizacion de datos operativos.

---

## Tecnologias Utilizadas

### Backend
- **Entorno de ejecucion:** Node.js
- **Framework:** Express.js (v5.1.0)
- **Base de Datos:** MySQL / MariaDB (mysql2 con promesas)
- **Seguridad:** JSON Web Tokens (JWT), BcryptJS (encriptacion de contrasenas)
- **Gestion de variables:** Dotenv

### Frontend
- **Framework:** React 19 (Vite)
- **Estilos:** Tailwind CSS (Soporte completo para Modo Oscuro nativo)
- **Graficos:** Recharts
- **Tablas:** React Data Table Component
- **Alertas:** SweetAlert2
- **Iconos:** Bootstrap Icons

---

## Configuracion e Instalacion

### Requisitos Previos
- Node.js instalado.
- Servidor MySQL o MariaDB en ejecucion.

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd rrhhu-comsertel
```

### 2. Instalacion Rapida (Raiz)
El proyecto incluye un script global para instalar las dependencias tanto en el backend como en el frontend de forma simultanea:
```bash
npm run install-all
```

### 3. Configuracion del Backend
Crea un archivo `.env` en la carpeta `backend/` basado en `backend/.env.example`:
```env
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contrasena
DB_NAME=comsertel_rh
PORT=3001
JWT_SECRET=una_clave_segura_aleatoria
```
*Nota: Asegurese de importar el script SQL incluido en el proyecto para crear la estructura de la base de datos.*

---

## Ejecucion en Desarrollo

Para ejecutar ambos servicios simultaneamente en paralelo desde el directorio raiz:
```bash
npm run dev
```
Este comando utilizara `concurrently` para lanzar el servidor del backend (puerto 3001) y el servidor de desarrollo del frontend (puerto 5173).

---

## Pruebas del Sistema

El proyecto cuenta con una suite de pruebas de extremo a extremo (E2E) mediante Playwright, localizadas en `frontend/app-react/tests/e2e/`.

### Ejecutar pruebas E2E
Para ejecutar las pruebas en modo interactivo o desde la terminal (dentro de `frontend/app-react`):
```bash
npx playwright test
```
*Nota: Se han disenado pruebas adversariales (Tier 5) en `frontend/app-react/tests/e2e/adversarial.spec.js` para simular y validar la tolerancia a fallos del sistema ante caidas del servidor (errores 500) e inyecciones de codigo (XSS).*

---

## Estructura del Proyecto

```text
rrhhu-comsertel/
├── backend/            # API REST (Node/Express)
│   ├── config/         # Conexion a DB
│   ├── controllers/    # Logica de negocio
│   ├── routes/         # Definicion de endpoints
│   └── .env            # Variables sensibles (no subir)
├── frontend/
│   └── app-react/      # Aplicacion SPA (React/Vite)
│       ├── src/
│       │   ├── components/ # Componentes reutilizables
│       │   ├── hooks/      # Hooks personalizados
│       │   ├── services/   # Llamadas al API
│       │   └── providers/  # Contextos (Auth/Theme)
│       └── tests/          # Pruebas e2e con Playwright
├── Documentacion/      # Guias detalladas y manuales
├── package.json        # Configuracion y scripts globales
└── README.md           # Archivo de inicio del repositorio
```

---

## Documentacion Adicional
Para mas detalles sobre el funcionamiento interno, consulte la carpeta `Documentacion/`:
- [Nuevo Modelo de Base de Datos](./Documentacion/Nuevo-Modelo-BD.md)
- [Guia de Seguridad y JWT](./Documentacion/Guia-JWT-y-Seguridad.md)
- [Buenas Practicas Backend](./Documentacion/Buenas-Practicas-Backend.md)
- [Buenas Practicas Frontend](./Documentacion/Buenas-Practicas-Frontend.md)
- [Sobre Este Proyecto](./Documentacion/Sobre-este-proyecto.md)

---

## Licencia
Este proyecto esta bajo la Licencia **Apache 2.0**. Consulta el archivo [LICENSE](./LICENSE) para mas detalles.

---
*Desarrollado para Comsertel S.A de C.V.*
