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
- **Framework:** React (Vite)
- **Estilos:** Tailwind CSS y Bootstrap (Coexistencia actual)
- **Navegación:** React Router DOM
- **Gráficos:** Recharts

### Backend
- **Entorno:** Node.js
- **Framework:** Express
- **Base de Datos:** MariaDB (anteriormente MySQL)
- **Autenticación:** JSON Web Tokens (JWT) y bcryptjs.

---

## 4. Inventario de Librerías y Dependencias

### Backend
| Librería | Procedencia | Licencia | Uso en el Proyecto |
| :--- | :--- | :--- | :--- |
| **express** | npm | MIT | Framework principal para la API REST. |
| **mysql2** | npm | MIT | Driver para la conexión con MariaDB/MySQL. |
| **jsonwebtoken** | npm | MIT | Generación y validación de tokens de seguridad (Login). |
| **bcryptjs** | npm | MIT | Encriptación de contraseñas de usuarios. |
| **cors** | npm | MIT | Permitir peticiones desde el frontend (puerto 5173). |
| **nodemon** | npm | MIT | Recarga automática del servidor en desarrollo (Dev tool). |
| **body-parser** | npm | MIT | Middleware para parsear el cuerpo de las peticiones HTTP. |

### Frontend
| Librería | Procedencia | Licencia | Uso en el Proyecto |
| :--- | :--- | :--- | :--- |
| **react** | npm | MIT | Librería principal de UI. |
| **axios** | npm | MIT | Cliente HTTP para consumir la API del backend. |
| **bootstrap** | npm | MIT | Framework de estilos (CSS tradicional y componentes). |
| **react-bootstrap** | npm | MIT | Componentes de Bootstrap adaptados a React (Modales, Cards). |
| **tailwindcss** | npm | MIT | Framework de utilidades CSS (Configurado pero con uso limitado). |
| **react-router-dom** | npm | MIT | Manejo de rutas y navegación entre páginas. |
| **recharts** | npm | MIT | Generación de gráficos en el Dashboard. |
| **react-data-table-component** | npm | MIT | Visualización de datos en tablas con filtros y paginación. |
| **sweetalert2** | npm | MIT | Modales de alerta y confirmación personalizados. |
| **react-select** | npm | MIT | Selectores avanzados (usado en roles y formularios). |

---

## 5. Configuración con Docker (MariaDB)

Para facilitar el despliegue y desarrollo, se recomienda utilizar MariaDB mediante Docker.

### Instrucciones para montar la instancia:

1.  **Asegúrate de tener Docker instalado.**
2.  **Ejecuta el siguiente comando en tu terminal:**
    ```bash
    docker run --name mariadb-comsertel \
      -e MARIADB_ROOT_PASSWORD=123 \
      -e MARIADB_DATABASE=comsertel_rh \
      -p 3306:3306 \
      -d mariadb:latest
    ```
3.  **Configuración del Backend:**
    Asegúrate de que en `backend/config/db.js` los datos coincidan:
    - Host: `localhost`
    - User: `root`
    - Password: `123`
    - Database: `comsertel_rh`

---

## 6. Transición al Nuevo Modelo de Datos (1NF, 2NF, 3NF)

El proyecto está evolucionando desde un esquema genérico inicial (encontrado en **`comsertel.sql`**) hacia uno altamente normalizado basado en **`Nueva-base.txt`** (esquema `comsertel_rh`) que cumple con las primeras tres formas normales.

**Objetivos de la transición:**
- Migrar de la gestión de inventario básica de `comsertel.sql` a la gestión de planillas profesional.
- Eliminar redundancias en nombres de departamentos y cargos.
- Asegurar la integridad referencial.
- Facilitar el cálculo de planillas basado en leyes salvadoreñas (ISSS, AFP, Renta).

*Para más detalles sobre el nuevo esquema, consulta:* `Documentacion/Nuevo-Modelo-BD.md`.

---

## 7. Puntos Importantes a Mejorar

1.  **Conflicto de Frameworks CSS (Bootstrap vs Tailwind):** Actualmente se utilizan ambos. Se recomienda elegir uno (preferiblemente Tailwind) y migrar gradualmente.
2.  **Estructura Pesada:** Es necesario refactorizar componentes para que sean más granulares y modulares.
3.  **Variables de Entorno:** Mover las credenciales de la DB y secretos de JWT a un archivo `.env`.
4.  **Validaciones:** Reforzar las validaciones tanto en el frontend como en el backend.

---
*Documentación actualizada el 5 de mayo de 2026.*
