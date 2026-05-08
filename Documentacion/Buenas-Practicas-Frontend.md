# Buenas Prácticas y Estructura: Frontend (React + Tailwind CSS)

Este documento establece las reglas para el desarrollo de la interfaz de usuario en el proyecto Comsertel. El objetivo principal es eliminar la dependencia de Bootstrap y estandarizar el uso de Tailwind CSS.

## 1. El "Gran Saneamiento" de Estilos (Prioridad Alta)
El proyecto actual tiene una "mezcla crítica" de Bootstrap, CSS puro y Tailwind. Esto causa conflictos de diseño y hace que el sitio pese el triple. **A partir del 5 de mayo de 2026, la regla es:**

- **Nuevos Componentes (v2_):** 100% Tailwind CSS. **Prohibido** usar clases de Bootstrap (`row`, `col`, `card`) o crear nuevos archivos `.css`.
- **Componentes Antiguos:** Se mantendrán con su CSS/Bootstrap hasta que se rediseñen. Una vez rediseñados, se **eliminará** su archivo `.css` correspondiente de la carpeta `src/css/`.
- **Meta Final:** Eliminar la importación de Bootstrap en `main.jsx` al finalizar la migración.

## 2. Estructura de Carpetas (Mantener Estructura Plana)
Para evitar niveles innecesarios de carpetas que compliquen el acceso, **no crearemos subcarpetas /v2**. En su lugar, usaremos el prefijo en el nombre del archivo dentro de las carpetas actuales:

1.  **`src/components/`**: Los nuevos componentes irán aquí con el nombre `v2_Nombre.jsx`.
2.  **`src/hooks/`**: Nuevos hooks como `v2_useEmpleados.js`.
3.  **`src/services/`**: Nuevos servicios como `v2_empleadoService.js`.
4.  **`src/pages/`**: Nuevas vistas como `v2_Dashboard.jsx`.

Esto permite que todos los archivos estén a la vista y se identifiquen rápidamente por su nombre sin tener que navegar por múltiples niveles de directorios.

## 3. Reglas de Oro para la IA y Humanos
- **No más CSS externo:** Si necesitas un margen, usa `m-4`. Si necesitas un color, usa `text-blue-600`. No abras un archivo `.css`.
- **Iconos:** Usar `bootstrap-icons` (solo la fuente de iconos) está permitido, pero no los componentes visuales de Bootstrap.
- **Responsividad:** Usa siempre los prefijos de Tailwind (`md:`, `lg:`) en lugar de Media Queries en CSS.

## 4. Ejemplo de un componente "Sano" (v2_):
```jsx
// src/components/v2/v2_ResumenPlanilla.jsx
import React from 'react';

const v2_ResumenPlanilla = ({ total, periodo }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg shadow-sm">
      <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider">{periodo}</h4>
      <p className="text-2xl font-mono text-slate-900">${total}</p>
    </div>
  );
};

export default v2_ResumenPlanilla;
```

## 3. Convenciones de Naming
- **Componentes:** `PascalCase.jsx` (ej. `BotonPrimario.jsx`).
- **Hooks:** `useCamelCase.js` (ej. `usePlanilla.js`).
- **Servicios:** `camelCase.js` (ej. `empleadoService.js`).

## 4. Manejo de Estado y Peticiones
- **Axios:** Usar una instancia centralizada de Axios para incluir tokens de autenticación automáticamente.
- **Feedback al Usuario:** Siempre mostrar un estado de "Cargando" o deshabilitar botones durante peticiones asíncronas.
- **Alertas:** Usar `SweetAlert2` para confirmaciones y errores críticos, manteniendo un estilo visual coherente con Tailwind.

## 5. Ejemplo de Componente Estándar (Tailwind)
```jsx
import React from 'react';

const CardEmpleado = ({ nombre, cargo, estado }) => {
  const isActivo = estado === 'ACTIVO';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-bold text-slate-800">{nombre}</h3>
      <p className="text-sm text-slate-500 mb-4">{cargo}</p>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        isActivo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {estado}
      </span>
    </div>
  );
};

export default CardEmpleado;
```

## 6. Checklist de Desarrollo
1. [ ] ¿El componente es responsivo?
2. [ ] ¿Se han evitado estilos en línea o archivos CSS externos?
3. [ ] ¿La lógica compleja está en un hook?
4. [ ] ¿Se manejan estados de error y carga?
