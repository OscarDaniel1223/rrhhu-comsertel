# E2E Test Infra: Migracion de Bootstrap a Tailwind CSS

Este documento define la filosofia de pruebas, la infraestructura de testing E2E, los Tiers de cobertura y las instrucciones para ejecutar las pruebas.

## Test Philosophy
Las pruebas E2E son de tipo caja negra (opaque-box) y orientadas a requerimientos, sin depender de la implementacion interna de las vistas. Se utiliza Playwright para simular la interaccion del usuario final y validar que los estilos visuales de Tailwind CSS presenten los componentes de forma responsiva y funcional.

## Feature Inventory
Tenemos 4 caracteristicas clave identificadas para validacion:
1. **Login de Usuario (F1):** Formulario, validaciones, redireccion al dashboard.
2. **Dashboard de Estadisticas (F2):** Carga de graficos, tarjetas de resumen, responsividad del diseño.
3. **Gestion de Empleados (F3):** Tabla de empleados, filtros, responsive layout.
4. **Gestion de Usuarios (F4):** Visualizacion de usuarios, modales de creacion/edicion de usuarios.

## Tiers de Cobertura de Pruebas

### Tier 1 - Feature Coverage (20 casos en total)
Happy-path de las 4 caracteristicas en multiples dimensiones:
- F1: Login exitoso, logout exitoso, visualizacion del formulario. (5 casos)
- F2: Carga exitosa de tarjetas basicas, barra de navegacion visible. (5 casos)
- F3: Carga de lista de empleados, ordenamiento responsive. (5 casos)
- F4: Carga de tarjetas de usuarios, apertura de modal de edicion. (5 casos)

### Tier 2 - Boundary & Corner Cases (20 casos en total)
Casos de borde, validaciones y comportamientos extremos:
- F1: Campos vacios, credenciales incorrectas, inyecciones en login, responsividad en dispositivos moviles (320px). (5 casos)
- F2: Comportamiento de graficos y tarjetas en pantallas super anchas (2560px) y moviles pequeños. (5 casos)
- F3: Tabla de empleados sin datos (vacia), textos extremadamente largos en celdas, comportamiento de filtros invalidos. (55 casos)
- F4: Modal abierto y redimensionado, envio de formulario de edicion de usuario con datos vacios. (5 casos)

### Tier 3 - Cross-Feature Combinations (4 casos en total)
Interaccion de caracteristicas entre si:
- T3.1: Login de usuario -> Modificacion del tema (Dark Mode) -> Navegacion al Dashboard -> Validacion visual.
- T3.2: Login -> Navegacion a gestion de usuarios -> Apertura de modal -> Edicion de usuario -> Validacion de refresco de tabla.
- T3.3: Login -> Navegacion a empleados -> Filtrado -> Cierre de sesion.
- T3.4: Login -> Apertura de modales multiples -> Cierre con teclado (ESC) -> Validacion de persistencia de sesion.

### Tier 4 - Real-World Application Scenarios (5 casos en total)
Flujos reales de extremo a extremo:
- T4.1: Flujo completo de administracion: Login admin -> Creacion de empleado -> Verificacion en tabla -> Edicion de rol -> Logout.
- T4.2: Auditoria de interfaz responsive: Login en movil -> Colapso de menu -> Navegacion a usuarios -> Apertura de modal -> Guardado.
- T4.3: Flujo de visualizacion de metricas en modo oscuro y claro: Login -> Verificacion de tarjetas y graficos -> Cambio de tema -> Verificacion visual.
- T4.4: Resiliencia ante desconexiones o errores de red simulados en modales de usuarios.
- T4.5: Flujo de navegacion intensiva y multiples operaciones sin recarga de pagina.

## Test Architecture
- **Framework:** Playwright Test
- **Ruta de pruebas:** `frontend/app-react/tests/e2e/`
- **Comando de ejecucion:** `npx playwright test`
- **Resultados esperados:** Salida limpia, reporte HTML autogenerado en `playwright-report/`.
