# Original User Request

## Initial Request - 2026-06-11T14:41:07-06:00

Migrar todos los componentes de React (archivos `.jsx`) ubicados en el directorio `frontend/app-react/src/components` y sus subcarpetas. La migración consiste en eliminar el uso de clases de Bootstrap y reescribir los estilos utilizando exclusivamente clases utilitarias de Tailwind CSS, manteniendo una estética moderna y corporativa.

Working directory: `/home/bladimir/Documentos/02 PROYECTOS/Proyecto RHU/rrhhu-comsertel/frontend/app-react/src/components`
Integrity mode: development

## Requirements

### R1. Refactorización a Tailwind CSS
Identificar y eliminar todas las clases CSS de Bootstrap (ej. `btn`, `card`, `container`, `row`, `col`, `form-control`, `text-center`) en todos los archivos `.jsx` del directorio especificado y sus subdirectorios. Sustituirlas por sus equivalentes exactos o mejorados utilizando clases nativas de Tailwind CSS.

### R2. Preservación de la lógica de React
Mantener intacta toda la lógica funcional (hooks, manejadores de eventos, props, importaciones de componentes y peticiones a APIs). La intervención debe limitarse de forma estricta a la capa de presentación (atributos `className`).

### R3. Estética Premium y Responsividad
Garantizar que los componentes rediseñados tengan un aspecto premium y responsivo, usando esquemas de color consistentes (por ejemplo, familia de colores `slate` and `blue`), sombras (`shadow-sm`, `shadow-md`), bordes redondeados (`rounded-lg`) y estados interactivos suaves (`hover:`, `transition-colors`).

## Acceptance Criteria

### Verificación de Código
- [ ] Ningún componente dentro de la carpeta `components/` contiene clases heredadas de Bootstrap.
- [ ] La aplicación no arroja errores de compilación ni errores de sintaxis JSX originados por el cambio de clases.

### Verificación Visual
- [ ] Los componentes mantienen una diagramación equivalente o superior a la original.
- [ ] Los componentes se adaptan correctamente a tamaños de pantalla móviles y de escritorio mediante prefijos responsivos (`sm:`, `md:`, `lg:`).
