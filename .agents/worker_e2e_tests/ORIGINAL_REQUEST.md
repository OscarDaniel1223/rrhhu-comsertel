## 2026-06-11T21:22:13Z
Eres un worker encargado de la implementacion y codificacion de los 49 casos de prueba E2E (Tiers 1-4) especificados en TEST_INFRA.md.

Tu carpeta de trabajo asignada para metadatos y coordinacion es `/home/bladimir/Documentos/02 PROYECTOS/Proyecto RHU/rrhhu-comsertel/.agents/worker_e2e_tests`. No debes escribir archivos de codigo aqui.

MISION:
1. Diseñar e implementar los 49 casos de prueba detallados en TEST_INFRA.md y organizarlos en los siguientes archivos dentro de la ruta `frontend/app-react/tests/e2e/`:
   - `login.spec.js`: Casos F1 del login (Tier 1 y Tier 2, total 10 casos).
   - `dashboard.spec.js`: Casos F2 del dashboard (Tier 1 y Tier 2, total 10 casos).
   - `employees.spec.js`: Casos F3 de empleados (Tier 1 y Tier 2, total 10 casos).
   - `users.spec.js`: Casos F4 de usuarios (Tier 1 y Tier 2, total 10 casos).
   - `cross_feature.spec.js`: Casos de Tier 3 (combinaciones de caracteristicas, total 4 casos).
   - `real_world.spec.js`: Casos de Tier 4 (flujos de aplicacion real y resiliencia, total 5 casos).
2. Para que los tests funcionen sin depender de un backend real (evitando problemas de puertos, bases de datos o servicios no levantados), debes mockear todas las peticiones a la API del backend (`http://localhost:3001/api/**`) usando la funcionalidad `page.route` de Playwright. Ejemplos de endpoints a interceptar:
   - `POST **/api/login` (retornar token, rol, nombre, etc. segun el rol 1, 2 o 3 para validar permisos de menu).
   - `POST **/api/change-password`
   - `GET **/api/CategoriesMostSold`, `GET **/api/getRegisterUsers`, `GET **/api/getRegisterClients`, `GET **/api/getVentasMes`, `GET **/api/getDailySales`, `GET **/api/getVentasMesAnterior`, `GET **/api/sellsLastThreeMonths`, `GET **/api/getReviews`
   - `GET **/api/empleados` (listar colaboradores v2), `POST **/api/empleados`, `DELETE **/api/empleados/*`
   - `GET **/api/cargos` (listar cargos v2)
   - `GET **/api/roles` (listar roles de usuarios)
   - `GET **/api/getUsuarios` (listar usuarios de la v1/v2), `POST **/api/new-user` (o el endpoint correspondiente para crear usuarios)
3. Ejecutar y validar la suite de pruebas completa ejecutando el comando validado por el equipo de infraestructura desde la raiz del proyecto:
   `npx -y -p @playwright/test -p playwright playwright test --config=frontend/app-react/playwright.config.js`
   Asegurar que todas las pruebas pasen al 100% y finalicen con codigo de salida 0.
4. Escribir tu reporte de handoff detallando los archivos creados, como se mockeo la API, y el resultado de las pruebas (copiar la salida del comando de ejecucion) en `/home/bladimir/Documentos/02 PROYECTOS/Proyecto RHU/rrhhu-comsertel/.agents/worker_e2e_tests/handoff.md` y enviar un mensaje al orquestador informando sobre la culminacion de tu tarea.

RESTRICCIONES:
- Todo debe responderse y redactarse en espanol.
- Queda prohibido el uso de emojis en todos los archivos, reportes, codigo y comentarios.
- Deberas mantener actualizado tu archivo `/home/bladimir/Documentos/02 PROYECTOS/Proyecto RHU/rrhhu-comsertel/.agents/worker_e2e_tests/progress.md` con la marca de tiempo `Last visited: [timestamp]` cada vez que completes un paso significativo.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
