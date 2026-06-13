# Guía Educativa: Autenticación con JWT y Seguridad en el Backend

Este documento explica cómo funciona la autenticación mediante JSON Web Tokens (JWT) y por qué es vital el uso de variables de entorno (`.env`) para proteger la integridad del sistema.

## 1. ¿Qué es un JWT (JSON Web Token)?

Imagina que un JWT es un **carnet de identidad digital** que el servidor le entrega al usuario después de que este pone su correo y contraseña correctamente. 

Este carnet tiene tres partes:
1.  **Cabecera (Header):** Dice qué tipo de carnet es.
2.  **Carga útil (Payload):** Contiene los datos del usuario (como su ID o Nombre), pero **no la contraseña**.
3.  **Firma (Signature):** Es el sello de seguridad.

## 2. El rol de la "Clave Secreta" (`JWT_SECRET`)

La clave secreta (como `your_jwt_secret_key_here` en tu `.env`) es el **sello metálico** que se usa para estampar la firma en el carnet.

*   **Sin la clave:** El servidor puede emitir el carnet, pero no puede probar que es auténtico.
*   **Si la clave se filtra:** Cualquier persona podría fabricar carnets falsos y entrar al sistema como Administrador.

Por eso, esta clave **NUNCA** debe estar escrita directamente en el código (`server.js` o `authController.js`), sino en el archivo `.env`.

## 3. El Flujo de Autenticación (Paso a Paso)

### Paso A: Inicio de Sesión (Login)
1.  El usuario envía su email/password.
2.  El servidor verifica en la BD. Si son correctos, el servidor "firma" un Token usando la `JWT_SECRET`.
3.  El servidor envía ese Token de vuelta al navegador del usuario.

### Paso B: Peticiones Protegidas (El futuro del proyecto)
Cuando el usuario quiera ver datos sensibles (como la lista de empleados), el flujo debería ser:
1.  El navegador envía el Token en la cabecera de la petición (Header).
2.  El servidor recibe el Token y usa la `JWT_SECRET` para verificar si la firma es válida.
3.  Si la firma coincide, el servidor entrega los datos. Si alguien cambió una sola letra del Token, la firma fallará y el servidor dirá "Acceso Denegado".

## 4. Estado Actual en este Proyecto

### Lo que ya se implementó:
*   **Emisión del Token:** En `authController.js`, ya se genera el token cuando el login es exitoso.
*   **Uso de .env:** Se movió la clave secreta al archivo `.env` para que no sea visible en el código fuente.

### Lo que falta implementar (Próximos pasos):
*   **Middleware de Verificación:** Crear una función que revise el token en cada ruta protegida antes de permitir el acceso a los datos.
*   **Manejo en Frontend:** Guardar el token en el navegador (LocalStorage o Cookies) y enviarlo de vuelta en cada consulta al API.

## 5. Mejores Prácticas
1.  **No guardes secretos en Git:** El archivo `.env` está en `.gitignore` por una razón: para que cada desarrollador tenga su propia clave local y no se suba a la nube.
2.  **Expiración:** Los tokens deben tener un tiempo de vida corto (ej. 1 hora) para reducir el riesgo si un token es robado.
3.  **HTTPS:** En el mundo real, los tokens siempre deben viajar por conexiones seguras (HTTPS) para que nadie pueda "escucharlos" en el camino.

---
*Este documento es parte de la capacitación técnica para el proyecto Comsertel RH.*
