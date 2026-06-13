# Guía de Creación de Usuarios

Esta guía explica cómo crear un nuevo usuario en el sistema utilizando la API del backend.

## Endpoint

- **URL:** `http://localhost:3001/api/newUser`
- **Método:** `POST`
- **Cuerpo (Body):** `JSON`

## Requerimientos del Body

Para crear un usuario exitosamente, se deben enviar los siguientes campos en formato JSON:

| Campo | Descripción | Tipo |
|-------|-------------|------|
| `nombres` | Nombre(s) del usuario | String |
| `apellidos` | Apellido(s) del usuario | String |
| `email` | Correo electrónico | String |
| `telefono` | Número telefónico | String |
| `numero_documento` | Documento de identidad | String |
| `idrol` | Identificador del rol (ej. 1 para Admin) | Integer |
| `password` | Contraseña en texto plano | String |

## Encriptación de Contraseña

**Sí, puedes usar Postman para agregar un usuario con la contraseña en texto plano.**

El controlador `backend/controllers/usuariosController.js` se encarga de la seguridad. Antes de guardar el usuario en la base de datos, el servidor realiza los siguientes pasos:

1. Recibe la contraseña en texto plano desde la solicitud.
2. Genera un "salt" utilizando `bcryptjs`.
3. Encripta la contraseña (hashing).
4. Almacena la contraseña ya encriptada en la base de datos.

## Ejemplo de uso en Postman

1. Abre Postman y crea una nueva solicitud.
2. Selecciona el método `POST`.
3. Ingresa la URL: `http://localhost:3001/api/newUser`.
4. Ve a la pestaña **Body**, selecciona **raw** y elige el formato **JSON**.
5. Pega el siguiente ejemplo y ajusta los datos:

```json
{
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan.perez@example.com",
    "telefono": "987654321",
    "numero_documento": "12345678",
    "idrol": 1,
    "password": "miPasswordSeguro123"
}
```

6. Haz clic en **Send**.

7. **Pide actualizar contraseña en la UI**
    - **Temporal:** `miPasswordSeguro123`
    - **Nueva:** `miPasswordSeguro123BBBBB`

Si todo es correcto, recibirás una respuesta con el estado `200` y el mensaje "Usuario creado correctamente".
