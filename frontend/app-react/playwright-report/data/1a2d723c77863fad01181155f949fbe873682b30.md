# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cross_feature.spec.js >> Pruebas Combinadas de Caracteristicas Tier 3 >> T3.2: Login -> Usuarios -> Modal -> Edicion -> Refresco de tabla
- Location: frontend/app-react/tests/e2e/cross_feature.spec.js:139:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Lista de usuarios")')

```

# Test source

```ts
  82  |         body: JSON.stringify({
  83  |           data: [
  84  |             { id_rol: 1, rol: 'Administrador' }
  85  |           ]
  86  |         })
  87  |       });
  88  |     });
  89  | 
  90  |     // Mockear cargos
  91  |     await page.route('**/api/cargos', async route => {
  92  |       await route.fulfill({
  93  |         status: 200,
  94  |         contentType: 'application/json',
  95  |         body: JSON.stringify({
  96  |           status: 'success',
  97  |           data: [{ id: 1, titulo: 'Desarrollador', departamento: 'Sistemas' }]
  98  |         })
  99  |       });
  100 |     });
  101 | 
  102 |     // Mockear empleados
  103 |     await page.route('**/api/empleados', async route => {
  104 |       await route.fulfill({
  105 |         status: 200,
  106 |         contentType: 'application/json',
  107 |         body: JSON.stringify({
  108 |           status: 'success',
  109 |           data: [{ id: 1, nombres: 'Carlos', apellidos: 'Perez', dui: '12345678-9', nit: '1234-567890-123-4', departamento: 'Sistemas', cargo: 'Desarrollador', salario_base: 1500, estado: 'ACTIVO' }]
  110 |         })
  111 |       });
  112 |     });
  113 | 
  114 |     // Mockear usuarios
  115 |     await page.route('**/api/getUsuarios', async route => {
  116 |       await route.fulfill({
  117 |         status: 200,
  118 |         contentType: 'application/json',
  119 |         body: JSON.stringify({
  120 |           data: [{ id_usuario: 1, nombre: 'Admin User', email: 'admin@comsertel.com', rol: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' }]
  121 |         })
  122 |       });
  123 |     });
  124 |   });
  125 | 
  126 |   test('T3.1: Login -> Cambio de tema (Dark Mode) -> Navegacion -> Validacion visual', async ({ page }) => {
  127 |     await doLogin(page);
  128 | 
  129 |     const themeBtn = page.locator('button:has-text("Modo Claro"), button:has-text("Modo Oscuro")');
  130 |     await expect(themeBtn).toBeVisible();
  131 | 
  132 |     await themeBtn.click();
  133 |     await expect(themeBtn).toContainText('Modo Claro');
  134 | 
  135 |     await page.click('button:has-text("Dashboard")');
  136 |     await expect(page.locator('text=Estadísticas')).toBeVisible();
  137 |   });
  138 | 
  139 |   test('T3.2: Login -> Usuarios -> Modal -> Edicion -> Refresco de tabla', async ({ page }) => {
  140 |     let callCount = 0;
  141 |     await page.route('**/api/getUsuarios', async route => {
  142 |       callCount++;
  143 |       if (callCount === 1) {
  144 |         await route.fulfill({
  145 |           status: 200,
  146 |           contentType: 'application/json',
  147 |           body: JSON.stringify({
  148 |             data: [{ id_usuario: 1, text: 'ref1', nombre: 'Admin User', email: 'admin@comsertel.com', rol: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' }]
  149 |           })
  150 |         });
  151 |       } else {
  152 |         await route.fulfill({
  153 |           status: 200,
  154 |           contentType: 'application/json',
  155 |           body: JSON.stringify({
  156 |             data: [{ id_usuario: 1, text: 'ref2', nombre: 'Admin Modificado', email: 'admin@comsertel.com', rol: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' }]
  157 |           })
  158 |         });
  159 |       }
  160 |     });
  161 | 
  162 |     await page.route('**/api/getUser*', async route => {
  163 |       await route.fulfill({
  164 |         status: 200,
  165 |         contentType: 'application/json',
  166 |         body: JSON.stringify({
  167 |           status: 200,
  168 |           data: { id_usuario: 1, nombre: 'Admin User', email: 'admin@comsertel.com', rol_nombre: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' }
  169 |         })
  170 |       });
  171 |     });
  172 | 
  173 |     await page.route('**/api/updateUser', async route => {
  174 |       await route.fulfill({
  175 |         status: 200,
  176 |         contentType: 'application/json',
  177 |         body: JSON.stringify({ status: 200, message: 'Usuario actualizado con éxito' })
  178 |       });
  179 |     });
  180 | 
  181 |     await doLogin(page);
> 182 |     await page.click('button:has-text("Lista de usuarios")');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  183 | 
  184 |     await page.click('button:has-text("Editar")');
  185 |     await page.fill('input#nombre_edit', 'Admin Modificado');
  186 |     await page.click('#form_edit_user button[type="submit"]');
  187 | 
  188 |     await page.click('.swal2-confirm');
  189 |     await page.click('.swal2-confirm');
  190 | 
  191 |     await expect(page.locator('text=Admin Modificado')).toBeVisible();
  192 |   });
  193 | 
  194 |   test('T3.3: Login -> Empleados -> Filtrado -> Cierre de sesion', async ({ page }) => {
  195 |     await doLogin(page);
  196 |     await page.click('button:has-text("Empleados")');
  197 | 
  198 |     const searchInput = page.locator('input[placeholder="Buscar por nombre, DUI, cargo..."]');
  199 |     await searchInput.fill('Carlos');
  200 |     await expect(page.locator('text=Carlos Perez')).toBeVisible();
  201 | 
  202 |     await page.click('button:has-text("Cerrar sesion")');
  203 |     await page.click('.swal2-confirm');
  204 | 
  205 |     await expect(page).toHaveURL(/\//);
  206 |   });
  207 | 
  208 |   test('T3.4: Login -> Modales multiples -> Cierre con ESC -> Persistencia de sesion', async ({ page }) => {
  209 |     await doLogin(page);
  210 |     await page.click('button:has-text("Lista de usuarios")');
  211 | 
  212 |     await page.click('button:has-text("Agregar")');
  213 |     const modal = page.locator('.modal-dialog');
  214 |     await expect(modal).toBeVisible();
  215 | 
  216 |     await page.keyboard.press('Escape');
  217 |     await expect(modal).not.toBeVisible();
  218 | 
  219 |     await expect(page).toHaveURL(/\/dashboard/);
  220 |   });
  221 | });
  222 | 
```