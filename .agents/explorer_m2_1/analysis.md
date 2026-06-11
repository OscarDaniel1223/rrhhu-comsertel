# Analisis de Migracion de Bootstrap a Tailwind CSS - Componentes M2

Este reporte contiene la identificacion de dependencias de Bootstrap/react-bootstrap y la estrategia de mapeo a clases utilitarias de Tailwind CSS para los 5 componentes seleccionados.

---

## 1. Componente: BtnLogout.jsx
* **Ruta:** `frontend/app-react/src/components/buttons/BtnLogout.jsx`

### Elementos de Bootstrap e Importaciones Identificados
* **Importaciones de react-bootstrap:** Ninguna.
* **Clases de Bootstrap utilizadas:**
  * `btn`: Clase base de botones en Bootstrap.
  * `btn-outline-primary`: Boton con borde de color primario y fondo transparente que se rellena al pasar el cursor (hover).
  * `w-100`: Ancho del 100% (width: 100%).
* **Iconos de Bootstrap:** `bi bi-box-arrow-left` (utilizado en la etiqueta `<i>`).

### Estrategia de Mapeo a Tailwind CSS
* **Clases de Reemplazo:**
  * `w-100` -> `w-full`
  * `btn` -> `inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200`
  * `btn-outline-primary` -> `border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white`
  * Para el icono `<i>`, se sugiere agregar un margen derecho para evitar que este pegado al texto: `mr-2`.

### Propuesta de Codigo (Antes vs. Despues)
* **Antes (Bootstrap):**
  ```jsx
  <button type="button" className="btn btn-outline-primary  w-100" onClick={logout}   > <i className="bi bi-box-arrow-left"></i> Cerrar sesion</button>
  ```
* **Despues (Tailwind CSS):**
  ```jsx
  <button 
      type="button" 
      className="w-full inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-md hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white" 
      onClick={logout}
  > 
      <i className="bi bi-box-arrow-left mr-2"></i> Cerrar sesion
  </button>
  ```

---

## 2. Componente: Header.jsx
* **Ruta:** `frontend/app-react/src/components/header/Header.jsx`

### Elementos de Bootstrap e Importaciones Identificados
* **Importaciones de react-bootstrap:** Ninguna.
* **Clases de Bootstrap utilizadas:**
  * `p-3`: Relleno interior de 1rem (16px).
  * `shadow-sm`: Sombra de caja pequena.
  * `fw-bold`: Peso de fuente negrita (font-weight: 700).
  * `mb-1`: Margen inferior de 0.25rem (4px).
  * `mb-0`: Margen inferior de 0 (margin-bottom: 0).
* **Clases Propias/Personalizadas:** `header`.

### Estrategia de Mapeo a Tailwind CSS
* **Clases de Reemplazo:**
  * `p-3` -> `p-3` (Mapeo directo)
  * `shadow-sm` -> `shadow-sm` (Mapeo directo)
  * `fw-bold` -> `font-bold`
  * `mb-1` -> `mb-1`
  * `mb-0` -> `mb-0`
  * Soporte de modo oscuro y tamano de texto para `h2`:
    * Titulo (`h2`): `text-2xl font-bold mb-1 text-slate-900 dark:text-white`
    * Subtitulo (`p`): `text-sm text-slate-600 dark:text-slate-400 mb-0`
    * Contenedor interno: Agregar `bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors` para el soporte completo de modo oscuro.

### Propuesta de Codigo (Antes vs. Despues)
* **Antes (Bootstrap):**
  ```jsx
  <div className="header">
      <div className="p-3 shadow-sm">

          <h2 className="fw-bold mb-1">{title}</h2>
          <p className="mb-0">{subtitle}</p>
      </div>
  </div>
  ```
* **Despues (Tailwind CSS):**
  ```jsx
  <div className="header">
      <div className="p-3 shadow-sm bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-0">{subtitle}</p>
      </div>
  </div>
  ```

---

## 3. Componente: SmallCard.jsx
* **Ruta:** `frontend/app-react/src/components/cards/SmallCard.jsx`

### Elementos de Bootstrap e Importaciones Identificados
* **Importaciones de react-bootstrap:**
  * `import Card from 'react-bootstrap/Card';` -> **¡Importacion no utilizada!** El componente no renderiza `<Card>`, sino un `div` con la clase `"card"`. Debe ser eliminada.
* **Clases de Bootstrap utilizadas:**
  * `card`: Estilos base de tarjeta (borde, fondo, esquinas redondeadas).
  * `shadow-sm`: Sombra de caja pequena.
  * `card-body`: Relleno interno de la tarjeta (1.25rem / 20px).
  * `d-flex`: Contenedor flexbox.
  * `justify-content-between`: Alineacion horizontal con espacio entre elementos.
  * `align-items-center`: Alineacion vertical centrada.
  * `mt-2`: Margen superior de 0.5rem (8px).
  * `fs-3`: Tamano de fuente grande (aproximadamente 1.75rem / 28px).
  * `fw-bold`: Peso de fuente negrita.
  * `fs-4`: Tamano de fuente mediano-grande (aproximadamente 1.5rem / 24px) para el icono.
  * `text-${color}`: Clase dinamica de color de texto.

### Estrategia de Mapeo a Tailwind CSS
* **Clases de Reemplazo:**
  * `card` -> `bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg`
  * `shadow-sm` -> `shadow-sm`
  * `card-body` -> `p-5`
  * `d-flex` -> `flex`
  * `justify-content-between` -> `justify-between`
  * `align-items-center` -> `items-center`
  * `mt-2` -> `mt-2`
  * `fs-3` -> `text-2xl md:text-3xl`
  * `fw-bold` -> `font-bold`
  * `fs-4` -> `text-xl md:text-2xl`
  * Mapeo del color dinamico `text-${color}`: Dado que Tailwind requiere nombres de clases completos para evitar que sean eliminados por el purgador, se propone utilizar un diccionario de mapeo interno para los colores de Bootstrap recibidos desde la API:
    ```javascript
    const colorMap = {
        primary: "text-blue-600 dark:text-blue-400",
        secondary: "text-slate-600 dark:text-slate-400",
        success: "text-emerald-600 dark:text-emerald-400",
        danger: "text-rose-600 dark:text-rose-400",
        warning: "text-amber-500 dark:text-amber-400",
        info: "text-cyan-600 dark:text-cyan-400",
        light: "text-slate-100 dark:text-slate-800",
        dark: "text-slate-800 dark:text-slate-100"
    };
    const iconColorClass = colorMap[color] || "text-slate-600 dark:text-slate-400";
    ```

### Propuesta de Codigo (Antes vs. Despues)
* **Antes (Bootstrap):**
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
* **Despues (Tailwind CSS):**
  ```jsx
  const colorMap = {
      primary: "text-blue-600 dark:text-blue-400",
      secondary: "text-slate-600 dark:text-slate-400",
      success: "text-emerald-600 dark:text-emerald-400",
      danger: "text-rose-600 dark:text-rose-400",
      warning: "text-amber-500 dark:text-amber-400",
      info: "text-cyan-600 dark:text-cyan-400",
      light: "text-slate-100 dark:text-slate-800",
      dark: "text-slate-800 dark:text-slate-100"
  };

  export default function SmallCard({ title, icon, count, color }) {
      const iconColorClass = colorMap[color] || "text-slate-600 dark:text-slate-400";

      return (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm transition-colors" style={{ borderBottom: `3px solid #4a82fcff` }}>
              <div className="p-5">
                  <small className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</small>

                  <div className="flex justify-between items-center mt-2">
                      <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{count}</span>
                      <i className={`${icon} ${iconColorClass} text-xl md:text-2xl`}></i>
                  </div>
              </div>
          </div>
      );
  }
  ```

---

## 4. Componente: ReviewsTables.jsx
* **Ruta:** `frontend/app-react/src/components/tables/ReviewsTables.jsx`

### Elementos de Bootstrap e Importaciones Identificados
* **Importaciones de react-bootstrap:**
  * `import Badge from "react-bootstrap/Badge";` -> **¡Importacion no utilizada!** No se hace uso de este componente en el archivo. Debe eliminarse.
* **Clases de Bootstrap utilizadas:** Ninguna en el codigo JSX.
* **Componentes externos y estilos en linea:**
  * `DataTable` (de `react-data-table-component`) configurado con un tema personalizado mediante `createTheme`.
  * Input de busqueda dentro de `subHeaderComponent` con estilos inline:
    ```javascript
    style={{
        padding: "6px 12px",
        borderRadius: 4,
        border: "1px solid #ccc",
        width: "250px",
    }}
    ```

### Estrategia de Mapeo a Tailwind CSS
* **Clases de Reemplazo para el Input:**
  * Reemplazar el objeto `style` por clases utilitarias de Tailwind:
    * `padding: "6px 12px"` -> `px-3 py-1.5`
    * `borderRadius: 4` -> `rounded`
    * `border: "1px solid #ccc"` -> `border border-slate-300 dark:border-slate-600`
    * `width: "250px"` -> `w-[250px]`
    * Soporte de modo oscuro y estados: `bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`
* **Optimizacion del Tema Oscuro de la Tabla:**
  * La tabla utiliza `createTheme('customDark', ...)` con colores estaticos (como el fondo `#1f2d40`). Estos valores pueden alinearse con la paleta de colores de Tailwind (por ejemplo, `#0f172a` para `bg-slate-900` o `#1e293b` para `bg-slate-800`) para lograr consistencia visual en toda la aplicacion.

### Propuesta de Codigo (Antes vs. Despues)
* **Antes (Bootstrap/Inline):**
  ```jsx
  import Badge from "react-bootstrap/Badge";
  // ...
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
* **Despues (Tailwind CSS):**
  ```jsx
  // Importacion de Badge eliminada
  // ...
  const subHeaderComponent = (
      <input
          type="text"
          placeholder="Buscar..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-[250px] transition-colors"
      />
  );
  ```

---

## 5. Componente: Employees.jsx
* **Ruta:** `frontend/app-react/src/components/contents/employees/Employees.jsx`

### Elementos de Bootstrap e Importaciones Identificados
* **Importaciones de react-bootstrap:** Ninguna.
* **Importaciones Externas no utilizadas:**
  * `import Select from "react-select";` -> **¡Importacion no utilizada!** Debe eliminarse si el componente no la requiere.
* **Clases de Bootstrap utilizadas:**
  * `row`: Genera un contenedor flex que actua como fila para la cuadricula de Bootstrap.
* **Otras Clases:**
  * `contenedor` (Clase personalizada con estilos especificos para el fondo en modo oscuro).
  * `rounded-xl` (Clase de estilo Tailwind / personalizada).

### Estrategia de Mapeo a Tailwind CSS
* **Clases de Reemplazo:**
  * `row` -> En Tailwind, una fila de cuadricula responsiva se implementa idealmente con Flexbox o CSS Grid. Dado que este contenedor esta vacio, al momento de estructurar su contenido interior se recomienda usar:
    * Opción Flex: `flex flex-wrap -mx-4` (para columnas tradicionales) o simplemente `flex flex-wrap gap-4`.
    * Opción Grid (Recomendada): `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.
    * Para mantener la consistencia con un contenedor de diseno simple: `className="contenedor flex flex-wrap gap-4 rounded-xl"`.
  * Limpieza del import no utilizado `Select`.

### Propuesta de Codigo (Antes vs. Despues)
* **Antes (Bootstrap/Import):**
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
* **Despues (Tailwind CSS):**
  ```jsx
  import React from "react";
  import Header from "../../header/Header";

  export default function Employees() {
      return (
          <>
              <Header title="Empleados" subtitle="Aqui puedes gestionar los empleados de tu sistema." />
              <div className="contenedor flex flex-wrap gap-4 rounded-xl">
                  {/* El contenido de los empleados ira aqui */}
              </div>
          </>
      );
  }
  ```
