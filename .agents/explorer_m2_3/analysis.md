# Reporte de Analisis - Migracion de Bootstrap a Tailwind CSS (Fase M2)

Este reporte detalla el analisis de 5 componentes de la fase M2 (Componentes Atomicos) para migrar sus estilos de Bootstrap y librerias relacionadas a clases utilitarias de Tailwind CSS.

---

## 1. BtnLogout.jsx

### Analisis del Estado Actual
- **Ruta del Archivo**: `frontend/app-react/src/components/buttons/BtnLogout.jsx`
- **Importaciones de React-Bootstrap**: Ninguna.
- **Clases de Bootstrap Identificadas**:
  - `btn`: Estilos base del boton de Bootstrap.
  - `btn-outline-primary`: Estilos de boton delineado primario.
  - `w-100`: Ancho del 100% (width: 100%).
- **Iconos**: Utiliza la clase de Bootstrap Icons `bi bi-box-arrow-left`.

### Estrategia de Migracion a Tailwind CSS
Para replicar el boton delineado primario responsivo con soporte para modo oscuro e interactividad, se propone mapear las clases de la siguiente manera:
- `w-100` -> `w-full`
- `btn btn-outline-primary` -> Combinacion de clases para:
  - Estructura y Flex: `px-4 py-2 border rounded font-medium focus:outline-none focus:ring-2 transition-all duration-200 flex items-center justify-center gap-2`
  - Colores (Modo Claro): `border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 focus:ring-offset-2`
  - Colores (Modo Oscuro): `dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white`

### Codigo Propuesto
**Antes:**
```jsx
<button type="button" className="btn btn-outline-primary  w-100" onClick={logout}   > <i className="bi bi-box-arrow-left"></i> Cerrar sesion</button>
```

**Despues:**
```jsx
<button 
    type="button" 
    className="w-full px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded font-medium transition-all duration-200 flex items-center justify-center gap-2" 
    onClick={logout}
>
    <i className="bi bi-box-arrow-left"></i>
    <span>Cerrar sesion</span>
</button>
```

---

## 2. Header.jsx

### Analisis del Estado Actual
- **Ruta del Archivo**: `frontend/app-react/src/components/header/Header.jsx`
- **Importaciones de React-Bootstrap**: Ninguna.
- **Clases de Bootstrap Identificadas**:
  - `p-3`: Relleno (padding: 1rem).
  - `shadow-sm`: Sombra pequeña.
  - `fw-bold`: Peso de fuente negrita (font-weight: 700).
  - `mb-1`: Margen inferior de nivel 1 (margin-bottom: 0.25rem).
  - `mb-0`: Margen inferior 0.
- **Clases/Estilos Personalizados**: `.header` (clase controlada en `dark_mode.css` para manejar el color de fondo en modo oscuro).
- **Importaciones Obsoletas/Sin Uso**: `import ThemeToggle from "../buttons/BtnToggleTheme";` en la linea 1 (no se renderiza en el JSX).

### Estrategia de Migracion a Tailwind CSS
Se eliminara la importacion innecesaria y se implementaran estilos nativos de Tailwind que manejen el modo oscuro sin depender de selectores CSS manuales de `dark_mode.css`.
- `p-3` -> `p-3` (equivalente en Tailwind)
- `shadow-sm` -> `shadow-sm` (equivalente en Tailwind)
- `fw-bold` -> `font-bold`
- `mb-1` -> `mb-1`
- `mb-0` -> `mb-0`
- Contenedor `.header`: Se reemplaza por clases de fondo y borde responsivas para el modo oscuro (`bg-white dark:bg-[#1f2d40] border-b border-gray-200 dark:border-gray-700`).
- Textos: Se añaden colores explicitos para asegurar legibilidad en modo oscuro (`text-gray-900 dark:text-white` para el titulo, y `text-gray-600 dark:text-gray-300` para el subtitulo).

### Codigo Propuesto
**Antes:**
```jsx
import ThemeToggle from "../buttons/BtnToggleTheme";

export default function Header({ title, subtitle }) {
    return (
        <div className="header">
            <div className="p-3 shadow-sm">

                <h2 className="fw-bold mb-1">{title}</h2>
                <p className="mb-0">{subtitle}</p>
            </div>
        </div>
    );
}
```

**Despues:**
```jsx
export default function Header({ title, subtitle }) {
    return (
        <div className="bg-white dark:bg-[#1f2d40] border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="p-3 shadow-sm">
                <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{title}</h2>
                <p className="mb-0 text-sm text-gray-600 dark:text-gray-300">{subtitle}</p>
            </div>
        </div>
    );
}
```

---

## 3. SmallCard.jsx

### Analisis del Estado Actual
- **Ruta del Archivo**: `frontend/app-react/src/components/cards/SmallCard.jsx`
- **Importaciones de React-Bootstrap**: `import Card from 'react-bootstrap/Card';` en la linea 1 (no se utiliza en el componente).
- **Clases de Bootstrap Identificadas**:
  - `card`: Contenedor de tarjeta.
  - `shadow-sm`: Sombra pequeña.
  - `card-body`: Contenedor interno con padding.
  - `d-flex`: Contenedor flexible (display: flex).
  - `justify-content-between`: Alineacion horizontal espaciada (justify-content: space-between).
  - `align-items-center`: Alineacion vertical centrada (align-items: center).
  - `mt-2`: Margen superior de nivel 2 (margin-top: 0.5rem).
  - `fs-3`: Tamaño de fuente de nivel 3 (aproximadamente 1.75rem).
  - `fw-bold`: Fuente negrita (font-weight: 700).
  - `text-${color}`: Clase dinamica para el color del icono.
  - `fs-4`: Tamaño de fuente del icono (aproximadamente 1.5rem).
- **Estilos en Linea**: `style={{ borderBottom: '3px solid #4a82fcff' }}`

### Problema con Clases Dinamicas y Tailwind CSS
El compilador de Tailwind analiza el codigo de manera estatica. Si construimos una clase dinamica como `text-${color}`, Tailwind no generara dicha clase en el archivo CSS final si no existe literalmente en el codigo. Ademas, el backend (ej. `statsController.js`) devuelve `"info"` como valor del parametro `color`.
**Solucion**: Crear un mapa estatico de colores en el componente que traduzca el nombre del color de Bootstrap a clases completas de Tailwind.

### Estrategia de Migracion a Tailwind CSS
- Eliminar la importacion sin uso de `Card`.
- `card` -> `bg-white dark:bg-[#1f2d40] border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200`
- `card-body` -> `p-4` (o `p-5`)
- `shadow-sm` -> `shadow-sm`
- `style={{ borderBottom: '3px solid #4a82fcff' }}` -> Se puede mantener inline o convertir a clase arbitraria `border-b-[3px] border-b-[#4a82fc]`.
- `d-flex justify-content-between align-items-center` -> `flex justify-between items-center`
- `mt-2` -> `mt-2`
- `fs-3 fw-bold` -> `text-2xl font-bold text-gray-900 dark:text-white`
- `fs-4` -> `text-xl`
- `text-${color}` -> Mapeado mediante un objeto literal:
  ```javascript
  const colorMap = {
      primary: "text-blue-600 dark:text-blue-400",
      success: "text-green-600 dark:text-green-400",
      danger: "text-red-600 dark:text-red-400",
      warning: "text-amber-500 dark:text-amber-400",
      info: "text-cyan-600 dark:text-cyan-400",
      secondary: "text-gray-600 dark:text-gray-400"
  };
  ```

### Codigo Propuesto
**Antes:**
```jsx
import Card from 'react-bootstrap/Card';

export default function SmallCard({ title, icon, count, color }) {
    return (
        <div className="card shadow-sm " style={{ borderBottom: `3px solid #4a82fcff` }}>
            <div className="card-body">
                <small >{title}</small>

                <div className="d-flex justify-content-between align-items-center mt-2">
                    <span className="fs-3 fw-bold">{count}</span>
                    <i className={`${icon} text-${color} fs-4`}></i>
                </div>
            </div>
        </div>
    );
}
```

**Despues:**
```jsx
export default function SmallCard({ title, icon, count, color }) {
    const colorMap = {
        primary: "text-blue-600 dark:text-blue-400",
        success: "text-green-600 dark:text-green-400",
        danger: "text-red-600 dark:text-red-400",
        warning: "text-amber-500 dark:text-amber-400",
        info: "text-cyan-600 dark:text-cyan-400",
        secondary: "text-gray-600 dark:text-gray-400"
    };

    const iconColorClass = colorMap[color] || "text-blue-600 dark:text-blue-400";

    return (
        <div className="bg-white dark:bg-[#1f2d40] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm border-b-[3px] border-b-[#4a82fc] transition-colors duration-200">
            <div className="p-4">
                <small className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</small>

                <div className="flex justify-between items-center mt-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{count}</span>
                    <i className={`${icon} ${iconColorClass} text-xl`}></i>
                </div>
            </div>
        </div>
    );
}
```

---

## 4. ReviewsTables.jsx

### Analisis del Estado Actual
- **Ruta del Archivo**: `frontend/app-react/src/components/tables/ReviewsTables.jsx`
- **Importaciones de React-Bootstrap**: `import Badge from "react-bootstrap/Badge";` en la linea 2 (no se utiliza en el componente).
- **Clases de Bootstrap Identificadas**: Ninguna directamente, ya que delega la visualización a `react-data-table-component`.
- **Estilos en Linea**: El buscador `<input>` tiene un atributo `style` personalizado.
  ```jsx
  style={{
      padding: "6px 12px",
      borderRadius: 4,
      border: "1px solid #ccc",
      width: "250px",
  }}
  ```

### Estrategia de Migracion a Tailwind CSS
- Eliminar la importacion sin uso de `Badge`.
- Migrar los estilos en linea del `<input>` buscador a clases de Tailwind CSS, añadiendo soporte completo para modo oscuro y estados interactivos (como `:focus` con anillos luminosos).
  - Estilos de entrada: `px-3 py-1.5 rounded border border-gray-300 w-[250px] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`
  - Soporte de modo oscuro en la entrada: `dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:ring-blue-400`

### Codigo Propuesto
**Antes (Seccion del SubHeader):**
```jsx
    const subHeaderComponent = (
        <input
            type="text"
            placeholder="Buscar..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
                padding: "6px 12px",
                borderRadius: 4,
                border: "1px solid #ccc",
                width: "250px",
            }}
        />
    );
```

**Despues (Seccion del SubHeader):**
```jsx
    const subHeaderComponent = (
        <input
            type="text"
            placeholder="Buscar..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="px-3 py-1.5 rounded border border-gray-300 w-[250px] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:focus:ring-blue-400 transition-colors duration-200"
        />
    );
```

---

## 5. Employees.jsx

### Analisis del Estado Actual
- **Ruta del Archivo**: `frontend/app-react/src/components/contents/employees/Employees.jsx`
- **Importaciones de React-Bootstrap**: Ninguna.
- **Clases de Bootstrap Identificadas**:
  - `row`: Define una fila de cuadricula en Bootstrap (con margenes negativos laterales).
- **Clases/Estilos Personalizados**: `.contenedor` (definida en `dark_mode.css` para el fondo en modo oscuro) y `rounded-xl` (que ya es una clase de Tailwind).
- **Importaciones Obsoletas/Sin Uso**:
  - `useState` de `"react"` (no se usa en este archivo).
  - `Select` de `"react-select"` (no se usa en este archivo).

### Estrategia de Migracion a Tailwind CSS
- Eliminar las importaciones sin uso (`useState` y `Select`).
- Reemplazar la combinacion de `contenedor row rounded-xl` por clases nativas de Tailwind CSS. Como el div esta vacio actualmente, el uso de la clase `row` de Bootstrap podria inducir desbordamiento horizontal debido a sus margenes negativos si no hay columnas hijas.
- Se propone un contenedor adaptado con fondo responsivo y transicion de colores suave para el modo oscuro:
  - Estilos del contenedor principal: `bg-white dark:bg-[#1f2d40] text-gray-900 dark:text-white p-6 rounded-xl shadow-sm transition-colors duration-200 flex flex-wrap gap-4`

### Codigo Propuesto
**Antes:**
```jsx
import React, { useState } from "react";
import Select from "react-select";
import Header from "../../header/Header";

export default function Employees() {

    return (

        <>
            <Header title="Empleados" subtitle="Aqui puedes gestionar los empleados de tu sistema." />
            <div className="contenedor row rounded-xl ">

            </div>
        </>

    );
}
```

**Despues:**
```jsx
import React from "react";
import Header from "../../header/Header";

export default function Employees() {
    return (
        <>
            <Header title="Empleados" subtitle="Aqui puedes gestionar los empleados de tu sistema." />
            <div className="bg-white dark:bg-[#1f2d40] text-gray-900 dark:text-white p-6 rounded-xl shadow-sm transition-colors duration-200 flex flex-wrap gap-4">
                {/* El contenido para gestionar empleados se agregara aqui */}
            </div>
        </>
    );
}
```
