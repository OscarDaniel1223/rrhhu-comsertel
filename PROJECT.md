# Proyecto: Migracion de Bootstrap a Tailwind CSS

Este documento describe la arquitectura global, descomposicion de hitos, contratos de interfaz y convenciones de codigo para la migracion de componentes React de Bootstrap a Tailwind CSS.

## Arquitectura y Diseno de Estilos
La aplicacion utiliza React con Vite y Tailwind CSS v4. Se eliminaran todas las dependencias y clases de Bootstrap para depender exclusivamente de Tailwind CSS, manteniendo el soporte de modo oscuro en combinacion con Tailwind (`dark:`).

### Pautas de Diseno de Tailwind CSS:
- **Colores:** Familia `slate` y `blue` para el esquema corporativo.
- **Bordes y Sombras:** `rounded-lg` para componentes principales, `shadow-sm` o `shadow-md` para tarjetas y contenedores.
- **Transiciones:** Estados interactivos con `transition-colors duration-200 hover:bg-blue-700` en botones y enlaces.
- **Grillas y Flexbox:** Reemplazar `row` y `col-*` de Bootstrap por `flex flex-col md:flex-row` o `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`.
- **Modales:** Reemplazar componentes `<Modal>` de `react-bootstrap` con elementos divs de posicionamiento absoluto/fijo controlados por el estado `show` de React, o utilizando la etiqueta `<dialog>` nativa de HTML5.

## Code Layout
- Componentes React: `frontend/app-react/src/components/`
- Estilos globales: `frontend/app-react/src/css/index.css`
- Configuracion del modo oscuro: `frontend/app-react/src/css/dark_mode.css`

## Milestones

| # | Hito | Descripcion | Dependencias | Status |
|---|------|-------------|--------------|--------|
| M1 | E2E Testing Track | Configuracion de la infraestructura de pruebas E2E e implementacion de las pruebas Tiers 1-4 | Ninguno | DONE |
| M2 | Componentes Atomicos | Migracion de BtnLogout.jsx, Header.jsx, SmallCard.jsx, ReviewsTables.jsx, Employees.jsx | M1 | PLANNED |
| M3 | Componentes Complejos y Tablas | Migracion de ReviewsCard.jsx, UsersCard.jsx, UsuariosTables.jsx | M2 | PLANNED |
| M4 | Formularios y Modales | Migracion de LoginForm.jsx, Modal_default.jsx, Modal_edit.jsx | M3 | PLANNED |
| M5 | Vistas de Alto Nivel | Migracion de Home.jsx, Users.jsx | M4 | PLANNED |
| M6 | Endurecimiento E2E | Verificacion de cobertura final de pruebas E2E y pruebas adversariales (Tier 5) | M5 | PLANNED |

## Interface Contracts
- **LoginForm.jsx:** Debe recibir `onLogin` y mantener el callback intacto.
- **Modal_default.jsx / Modal_edit.jsx:** Deben conservar las props `show`, `onHide`, `title` y `children` para comportarse exactamente igual que los modales de react-bootstrap.
- **UsuariosTables.jsx / ReviewsTables.jsx:** Deben conservar los mismos callbacks para acciones (editar, borrar, activar) y props de datos.
