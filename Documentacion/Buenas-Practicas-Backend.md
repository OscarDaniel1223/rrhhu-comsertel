# Buenas Prácticas y Estructura: Backend (Node.js/Express)

Este documento define el estándar de desarrollo para el backend del proyecto Comsertel, con el fin de asegurar escalabilidad, seguridad y consistencia entre desarrolladores e IAs.

## 1. Estructura de Carpetas
Se debe seguir un patrón modular basado en responsabilidades:
- `config/`: Configuraciones de base de datos y variables de entorno.
- `routes/`: Definición de endpoints y asociación con controladores.
- `controllers/`: Lógica de manejo de peticiones y respuestas HTTP.
- `services/`: (Opcional) Lógica de negocio pesada o cálculos complejos (ej. cálculos de planilla).
- `middlewares/`: Funciones de validación, autenticación y manejo de errores.
- `utils/`: Funciones de ayuda reutilizables.
## 2. Convenciones de Naming y Coexistencia
Para evitar confusiones entre el código del sistema anterior (`workshop`) y el nuevo sistema de planillas (`comsertel_rh`), se establece la siguiente regla:

- **Archivos Nuevos (v2):** Todo controlador o ruta que pertenezca al nuevo modelo debe llevar el prefijo `v2_` (ej. `v2_empleadoController.js`).
- **Archivos Antiguos (Legacy):** Los archivos existentes se mantendrán sin cambios hasta su eliminación total al final del Proyecto.
- **Rutas:** Usar `kebab-case` para los endpoints (ej. `/api/boletas-pago`).
- **Variables y Funciones:** Usar `camelCase` (ej. `obtenerEmpleados`).
- **Clases:** Usar `PascalCase` (ej. `CalculadoraPlanilla`).
- **Idioma:**
    - **Técnico (Código):** Se usará inglés para estructuras estándar (ej. `try/catch`, `req`, `res`, `data`, `status`).
    - **Negocio (Base de Datos y Lógica):** Se usará español para nombres de tablas, campos y mensajes al usuario (ej. `empleado`, `salario_base`, "Usuario no encontrado").

## 3. Seguridad y CORS
El middleware `cors()` en `server.js` es fundamental. Su función es permitir que el Frontend (puerto 5173) pueda hacer peticiones al Backend (puerto 3001). Sin esto, el navegador bloquearía las peticiones por seguridad.

## 4. Limpieza de Controladores (Validaciones)
Los controladores actuales tienen mucha lógica de validación (ej. `if (!email) ...`). 
- **Mejora Sugerida:** Mover las validaciones pesadas a la carpeta `middlewares/`. El controlador solo debe recibir datos ya validados y ejecutar la consulta a la BD.

## 5. Estándar de Respuesta API
...

Todas las respuestas deben ser JSON y seguir esta estructura:

**Éxito:**
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operación exitosa"
}
```

**Error:**
```json
{
  "status": "error",
  "error": "Código o nombre del error",
  "message": "Descripción amigable para el usuario"
}
```

## 4. Principios de Desarrollo
- **Async/Await:** Evitar el uso de callbacks. Siempre usar `try/catch` para manejar errores asíncronos.
- **Validación:** Validar los datos de entrada (`req.body`, `req.params`) antes de procesarlos.
- **Seguridad:**
    - Nunca devolver contraseñas en las consultas.
    - Usar JWT para rutas protegidas.
    - Guardar secretos y credenciales en archivos `.env`.
- **Base de Datos:**
    - Usar consultas preparadas (placeholders `?`) para evitar inyección SQL.
    - Mantener la conexión mediante un Pool de conexiones.

## 5. Ejemplo de Controlador Estándar
```javascript
const getEmpleadoById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM empleados WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Empleado no encontrado'
            });
        }

        res.json({
            status: 'success',
            data: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor'
        });
    }
};
```
