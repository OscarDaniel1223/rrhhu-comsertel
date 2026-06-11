# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cross_feature.spec.js >> Pruebas Combinadas de Caracteristicas Tier 3 >> T3.1: Login -> Cambio de tema (Dark Mode) -> Navegacion -> Validacion visual
- Location: frontend/app-react/tests/e2e/cross_feature.spec.js:126:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Modo Claro"), button:has-text("Modo Oscuro")')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button:has-text("Modo Claro"), button:has-text("Modo Oscuro")')

```

# Test source

```ts
  30  |     await expect(page).toHaveURL(/\/dashboard/);
  31  |     await page.waitForTimeout(500); // Esperar a que React se estabilice tras la redireccion
  32  |   };
  33  | 
  34  |   test.beforeEach(async ({ page }) => {
  35  |     // Mockear endpoints comunes del dashboard con datos para evitar crash
  36  |     await page.route('**/api/getRegisterUsers', async route => {
  37  |       await route.fulfill({
  38  |         status: 200,
  39  |         contentType: 'application/json',
  40  |         body: JSON.stringify({ data: [{ title: 'Usuarios', icon: 'bi-people', count: 0, color: 'blue' }] })
  41  |       });
  42  |     });
  43  |     await page.route('**/api/getRegisterClients', async route => {
  44  |       await route.fulfill({
  45  |         status: 200,
  46  |         contentType: 'application/json',
  47  |         body: JSON.stringify({ data: [{ title: 'Clientes', icon: 'bi-people', count: 0, color: 'green' }] })
  48  |       });
  49  |     });
  50  |     await page.route('**/api/getVentasMes', async route => {
  51  |       await route.fulfill({
  52  |         status: 200,
  53  |         contentType: 'application/json',
  54  |         body: JSON.stringify({ data: [{ title: 'Ventas Mes', icon: 'bi-cart', count: 0, color: 'orange' }] })
  55  |       });
  56  |     });
  57  |     await page.route('**/api/getDailySales', async route => {
  58  |       await route.fulfill({
  59  |         status: 200,
  60  |         contentType: 'application/json',
  61  |         body: JSON.stringify({ data: [{ title: 'Ventas Diarias', icon: 'bi-cash', count: 0, color: 'purple' }] })
  62  |       });
  63  |     });
  64  |     await page.route('**/api/getVentasMesAnterior', async route => {
  65  |       await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  66  |     });
  67  |     await page.route('**/api/sellsLastThreeMonths', async route => {
  68  |       await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  69  |     });
  70  |     await page.route('**/api/CategoriesMostSold', async route => {
  71  |       await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  72  |     });
  73  |     await page.route('**/api/getReviews', async route => {
  74  |       await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
  75  |     });
  76  | 
  77  |     // Mockear roles
  78  |     await page.route('**/api/getRoles', async route => {
  79  |       await route.fulfill({
  80  |         status: 200,
  81  |         contentType: 'application/json',
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
> 130 |     await expect(themeBtn).toBeVisible();
      |                            ^ Error: expect(locator).toBeVisible() failed
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
  182 |     await page.click('button:has-text("Lista de usuarios")');
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