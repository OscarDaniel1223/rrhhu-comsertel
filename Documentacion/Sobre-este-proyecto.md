# Sobre este proyecto: RRHHU Comsertel

Este documento proporciona una visión general técnica del proyecto, su arquitectura, tecnologías utilizadas y guía de configuración.

## 1. Política de Control de Versiones e Instalación (¡LECTURA OBLIGATORIA!)

A partir del **5 de mayo de 2026**, se establece una política estricta de **"Solo Código"** para el repositorio para evitar descargas ineficientes (anteriormente superiores a 200MB por error).

### Reglas de Exclusión (GitIgnore)
Queda estrictamente prohibido subir:
1.  **`node_modules/`**: Se deben instalar localmente mediante `npm install`.
2.  **Archivos de Entorno (`.env`)**: Contienen credenciales sensibles y deben configurarse localmente.
3.  **Carpetas de Compilación (`dist/`, `build/`, `out/`)**: El código compilado no debe versionarse.
4.  **Logs y Archivos de IDE** (`.vscode/`, `.idea/`).

### Uso Correcto de NPM
Para instalar las dependencias tras clonar el proyecto:
*    **`npm install`** o **`npm i`**: Comando estándar.
*    **`npm ci` (Recomendación Pro)**: Instalación limpia basada en `package-lock.json`.
*    **NUNCA usar `npm install i`**: Error común que instala un paquete innecesario.

### Gestión de Versiones de Node.js
- **Versión del Proyecto:** Se recomienda utilizar Node.js **v20.x (LTS)** o superior.
- **Mejor Práctica:** Utilizar **NVM (Node Version Manager)** para gestionar múltiples versiones de Node en tu máquina. Esto permite cambiar de versión fácilmente según el proyecto:
  ```bash
  nvm install 20
  nvm use 20
  ```

### 1.1 Educación Técnica: Callbacks vs Async/Await

En el código original (`articulosController.js`), se utilizaban **Callbacks**. Es una forma antigua de manejar procesos que tardan tiempo (como consultas a la BD).

#### ¿Por qué cambiar?
1.  **Callback Hell:** Si tienes varias consultas seguidas, el código se vuelve una pirámide imposible de leer.
2.  **Manejo de Errores:** Con callbacks, debes manejar el error en cada paso. Con `Async/Await` usas un solo bloque `try/catch`.
3.  **Legibilidad:** El código parece secuencial (como si no fuera asíncrono), lo que facilita su comprensión.

#### Ejemplo de Transformación (Fase 1)

**Estilo Viejo (Callback):**
```javascript
db.query(SQL, params, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
});
```

**Estilo Nuevo (Async/Await - Recomendado):**
```javascript
const articulosGet = async (req, res) => {
    try {
        // El 'await' espera a que la BD responda antes de seguir
        const [results] = await db.query(SQL, params); 
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
};
```

---

## 2. Introducción
...
El proyecto es una aplicación web full-stack diseñada para la gestión de recursos humanos y operaciones. Actualmente se encuentra en una fase de transición hacia un sistema especializado en **Control de Planillas y Recursos Humanos** para la empresa **Comsertel S.A. de C.V.**

## 3. Arquitectura y Tecnologías

### Frontend
- **Framework:** React 19 (Vite)
- **Estilos:** Tailwind CSS (Uso exclusivo, soporte para Modo Oscuro nativo a nivel del documento)
- **Navegacion:** React Router DOM
- **Graficos:** Recharts

### Backend
- **Entorno:** Node.js (v20.x o superior)
- **Framework:** Express.js (v5.1.0)
- **Base de Datos:** MariaDB / MySQL (mysql2 con promesas)
- **Autenticacion:** JSON Web Tokens (JWT) y bcryptjs.

---

## 4. Inventario de Librerias y Dependencias

### Backend
| Libreria | Procedencia | Licencia | Uso en el Proyecto |
| :--- | :--- | :--- | :--- |
| **express** | npm | MIT | Framework principal para la API REST. |
| **mysql2** | npm | MIT | Driver para la conexion con MariaDB/MySQL. |
| **jsonwebtoken** | npm | MIT | Generacion y validacion de tokens de seguridad (Login). |
| **bcryptjs** | npm | MIT | Encriptacion de contrasenas de usuarios. |
| **cors** | npm | MIT | Permitir peticiones desde el frontend (puerto 5173). |
| **nodemon** | npm | MIT | Recarga automatica del servidor en desarrollo (Dev tool). |
| **body-parser** | npm | MIT | Middleware para parsear el cuerpo de las peticiones HTTP. |

### Frontend
| Libreria | Procedencia | Licencia | Uso en el Proyecto |
| :--- | :--- | :--- | :--- |
| **react** | npm | MIT | Libreria principal de UI. |
| **axios** | npm | MIT | Cliente HTTP para consumir la API del backend. |
| **tailwindcss** | npm | MIT | Framework de utilidades CSS (Estilo exclusivo para toda la UI, incluye variacion dark). |
| **react-router-dom** | npm | MIT | Manejo de rutas y navegacion entre paginas. |
| **recharts** | npm | MIT | Generacion de graficos en el Dashboard. |
| **react-data-table-component** | npm | MIT | Visualizacion de datos en tablas con filtros y paginacion. |
| **sweetalert2** | npm | MIT | Modales de alerta y confirmacion personalizados. |
| **react-select** | npm | MIT | Selectores avanzados (usado en roles y formularios). |

---

## 5. Configuracion con Docker (MariaDB)

Para facilitar el despliegue y desarrollo, se recomienda utilizar MariaDB mediante Docker.

### Instrucciones para montar la instancia:

1.  **Asegurate de tener Docker instalado.**
2.  **Ejecuta el siguiente comando en tu terminal:**
    ```bash
    docker run --name mariadb-comsertel \
      -e MARIADB_ROOT_PASSWORD=123 \
      -e MARIADB_DATABASE=comsertel_rh \
      -p 3306:3306 \
      -d mariadb:latest
    ```
3.  **Configuracion del Backend:**
    Asegurate de que en `backend/config/db.js` los datos coincidan:
    - Host: `localhost`
    - User: `root`
    - Password: `123`
    - Database: `comsertel_rh`

---

## 6. Transicion al Nuevo Modelo de Datos (1NF, 2NF, 3NF)

El proyecto esta evolucionando desde un esquema generico inicial (encontrado en **`comsertel.sql`**) hacia uno altamente normalizado basado en **`Nueva-base.txt`** (esquema `comsertel_rh`) que cumple con las primeras tres formas normales.

**Objetivos de la transicion:**
- Migrar de la gestion de inventario basica de `comsertel.sql` a la gestion de planillas profesional.
- Eliminar redundancias en nombres de departamentos y cargos.
- Asegurar la integridad referencial.
- Facilitar el calculo de planillas basado en leyes salvadorenas (ISSS, AFP, Renta).

*Para mas detalles sobre el nuevo esquema, consulta:* `Documentacion/Nuevo-Modelo-BD.md`.

---

## 7. Puntos Importantes Completados y Mejoras

1.  **Saneamiento de Frameworks CSS (Resuelto):** Se elimino por completo la dependencia de Bootstrap y React Bootstrap. Ahora la interfaz de usuario esta disenada en su totalidad con Tailwind CSS.
2.  **Modo Oscuro Integrado:** Se configuro un Modo Oscuro nativo a nivel global mediante `ThemeContext` y el uso de la clase `.dark` en el `documentElement`/`body`, sincronizado con estilos condicionales `dark:` en Tailwind.
3.  **Pruebas Adversariales E2E:** Se introdujo una suite de pruebas automatizadas con Playwright (`tests/e2e/adversarial.spec.js`) para validar la resistencia de los formularios ante inyecciones de codigo (XSS) y fallos del backend (codigos 500).
4.  **Ejecucion y Gestion Simplificada:** Se creo un `package.json` en la raiz del repositorio con comandos basados en `concurrently` para lanzar backend y frontend simultaneamente con un solo comando (`npm run dev`).

---
*Documentacion actualizada el 12 de junio de 2026.*
