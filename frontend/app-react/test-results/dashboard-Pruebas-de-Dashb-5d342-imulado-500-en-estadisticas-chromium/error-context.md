# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.js >> Pruebas de Dashboard F2 >> Caso 9: Dashboard con error de red simulado (500) en estadisticas
- Location: frontend/app-react/tests/e2e/dashboard.spec.js:184:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Estadísticas')
Expected: visible
Error: strict mode violation: locator('text=Estadísticas') resolved to 2 elements:
    1) <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Estadísticas</h2> aka getByRole('heading', { name: 'Estadísticas' })
    2) <p class="text-sm text-slate-500 dark:text-slate-400 mb-0">Aquí puedes ver estadísticas generales.</p> aka getByText('Aquí puedes ver estadísticas')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Estadísticas')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic:
      - text: 
      - generic [ref=e5]:
        - text: 
        - generic [ref=e6]:
          - generic [ref=e7]:
            - img "Logo de empresa" [ref=e9]
            - generic [ref=e10]:
              - img "Icono de usuario" [ref=e11]
              - paragraph [ref=e12]: Admin User
            - generic [ref=e13]:
              - button " Dashboard " [ref=e14]:
                - generic [ref=e15]: 
                - text: Dashboard
                - generic [ref=e16]: 
              - button " Productos" [ref=e17]:
                - generic [ref=e18]: 
                - text: Productos
              - button " Ventas" [ref=e19]:
                - generic [ref=e20]: 
                - text: Ventas
              - button " Reportes" [ref=e21]:
                - generic [ref=e22]: 
                - text: Reportes
            - generic [ref=e23]:
              - heading " Empleados" [level=6] [ref=e24]:
                - generic [ref=e25]: 
                - text: Empleados
              - generic [ref=e26]:
                - button "Empleados" [ref=e27]: Empleados
                - button "Ausencias" [ref=e28]: Ausencias
            - generic [ref=e29]:
              - heading " Planillas" [level=6] [ref=e30]:
                - generic [ref=e31]: 
                - text: Planillas
              - generic [ref=e32]:
                - button "Generar planilla" [ref=e33]: Generar planilla
                - button "Reportes" [ref=e34]: Reportes
            - generic [ref=e35]:
              - heading " Configuraciones" [level=6] [ref=e36]:
                - generic [ref=e37]: 
                - text: Configuraciones
              - generic [ref=e38]:
                - button " Lista de usuarios" [ref=e39]:
                  - generic [ref=e40]: 
                  - text: Lista de usuarios
                - button " Tipos de ausencias" [ref=e41]:
                  - generic [ref=e42]: 
                  - text: Tipos de ausencias
          - generic [ref=e43]:
            - button " Cerrar sesion" [ref=e44]:
              - generic [ref=e45]: 
              - text: Cerrar sesion
            - button " Modo Claro" [ref=e46] [cursor=pointer]:
              - generic [ref=e47]: 
              - text: Modo Claro
    - generic [ref=e48]:
      - generic [ref=e50]:
        - heading "Estadísticas" [level=2] [ref=e51]
        - paragraph [ref=e52]: Aquí puedes ver estadísticas generales.
      - generic [ref=e63]:
        - generic [ref=e66]:
          - generic [ref=e67]: Ventas ultimos 3 meses
          - application [ref=e69]
        - generic [ref=e77]:
          - generic [ref=e78]: Top 5 categorias mas vendidas este mes
          - application [ref=e80]
        - generic [ref=e84]:
          - generic [ref=e85]: Ingresos este mes vs mes anterior
          - generic [ref=e86]:
            - list [ref=e88]:
              - listitem [ref=e89]:
                - img "Ingresos este mes legend icon" [ref=e90]
                - text: Ingresos este mes
              - listitem [ref=e92]:
                - img "Ingresos mes anterior legend icon" [ref=e93]
                - text: Ingresos mes anterior
            - application [ref=e95]
        - generic [ref=e104]:
          - heading "Reseñas de este mes" [level=3] [ref=e105]
          - paragraph [ref=e106]: No hay reseñas
  - contentinfo [ref=e107]:
    - paragraph [ref=e108]: © 2026 Todos los derechos reservados. |
```

# Test source

```ts
  95  |         body: JSON.stringify({
  96  |           data: [
  97  |             { id: 1, cliente: 'Cliente A', comentario: 'Excelente servicio', calificacion: 5 },
  98  |             { id: 2, cliente: 'Cliente B', comentario: 'Muy bueno', calificacion: 4 }
  99  |           ]
  100 |         })
  101 |       });
  102 |     });
  103 |   });
  104 | 
  105 |   // T1.1: Carga de tarjetas basicas
  106 |   test('Caso 1: Carga de tarjetas basicas de estadisticas', async ({ page }) => {
  107 |     await doLogin(page);
  108 |     await expect(page.locator('text=Usuarios registrados')).toBeVisible();
  109 |     await expect(page.locator('text=Clientes registrados')).toBeVisible();
  110 |     await expect(page.locator('text=Ventas de este mes')).toBeVisible();
  111 |     await expect(page.locator('text=Ventas del dia')).toBeVisible();
  112 |   });
  113 | 
  114 |   // T1.2: Grafico Ventas ultimos 3 meses
  115 |   test('Caso 2: Grafico Ventas ultimos 3 meses visible', async ({ page }) => {
  116 |     await doLogin(page);
  117 |     await expect(page.locator('text=Ventas ultimos 3 meses')).toBeVisible();
  118 |   });
  119 | 
  120 |   // T1.3: Top 5 categorias mas vendidas
  121 |   test('Caso 3: Grafico Top 5 categorias mas vendidas este mes visible', async ({ page }) => {
  122 |     await doLogin(page);
  123 |     await expect(page.locator('text=Top 5 categorias mas vendidas este mes')).toBeVisible();
  124 |   });
  125 | 
  126 |   // T1.4: Ingresos este mes vs mes anterior
  127 |   test('Caso 4: Grafico Ingresos este mes vs mes anterior visible', async ({ page }) => {
  128 |     await doLogin(page);
  129 |     await expect(page.locator('text=Ingresos este mes vs mes anterior')).toBeVisible();
  130 |   });
  131 | 
  132 |   // T1.5: Resenas de este mes
  133 |   test('Caso 5: Carga de tabla de resenas de este mes', async ({ page }) => {
  134 |     await doLogin(page);
  135 |     await expect(page.locator('text=Reseñas de este mes')).toBeVisible();
  136 |     await expect(page.locator('text=Cliente A')).toBeVisible();
  137 |     await expect(page.locator('text=Excelente servicio')).toBeVisible();
  138 |   });
  139 | 
  140 |   // T2.1: Pantallas super anchas (2560px)
  141 |   test('Caso 6: Dashboard estructurado en pantalla super ancha (2560px)', async ({ page }) => {
  142 |     await page.setViewportSize({ width: 2560, height: 1440 });
  143 |     await doLogin(page);
  144 |     await expect(page.locator('text=Usuarios registrados')).toBeVisible();
  145 |     await expect(page.locator('text=Ventas ultimos 3 meses')).toBeVisible();
  146 |   });
  147 | 
  148 |   // T2.2: Dispositivos moviles pequeños (320px) y menu hamburguesa
  149 |   test('Caso 7: Menu y dashboard adaptados a pantalla movil (320px)', async ({ page }) => {
  150 |     await page.setViewportSize({ width: 320, height: 568 });
  151 |     await doLogin(page);
  152 | 
  153 |     // Sidebar debe estar oculto inicialmente
  154 |     const sidebar = page.locator('div.fixed.top-0.left-0.h-screen.w-64');
  155 |     await expect(sidebar).toHaveClass(/translate-x-full/);
  156 | 
  157 |     // Boton hamburguesa debe estar visible
  158 |     const hamburger = page.locator('.lg\\:hidden.fixed.top-4.right-4');
  159 |     await expect(hamburger).toBeVisible();
  160 | 
  161 |     // Hacer clic en boton hamburguesa
  162 |     await hamburger.click();
  163 |     // Sidebar debe desplegarse
  164 |     await expect(sidebar).toHaveClass(/translate-x-0/);
  165 |   });
  166 | 
  167 |   // T2.3: Dashboard sin datos (tarjetas vacias o en 0)
  168 |   test('Caso 8: Comportamiento del Dashboard con datos vacios', async ({ page }) => {
  169 |     await page.route('**/api/getRegisterUsers', async route => {
  170 |       await route.fulfill({
  171 |         status: 200,
  172 |         contentType: 'application/json',
  173 |         body: JSON.stringify({ data: [{ title: 'Usuarios registrados', icon: 'bi-people', count: 0, color: 'blue' }] })
  174 |       });
  175 |     });
  176 | 
  177 |     await doLogin(page);
  178 |     await expect(page.locator('text=Usuarios registrados')).toBeVisible();
  179 |     // Debe mostrar count en 0
  180 |     await expect(page.locator('text=Usuarios registrados').locator('xpath=../..').locator('text=0')).toBeVisible();
  181 |   });
  182 | 
  183 |   // T2.4: Dashboard con error de red en carga de estadisticas
  184 |   test('Caso 9: Dashboard con error de red simulado (500) en estadisticas', async ({ page }) => {
  185 |     await page.route('**/api/getRegisterUsers', async route => {
  186 |       await route.fulfill({
  187 |         status: 500,
  188 |         contentType: 'application/json',
  189 |         body: JSON.stringify({ message: 'Error de servidor' })
  190 |       });
  191 |     });
  192 | 
  193 |     await doLogin(page);
  194 |     // Verificamos que la app siga de pie y muestre la estructura basica de estadisticas
> 195 |     await expect(page.locator('text=Estadísticas')).toBeVisible();
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  196 |   });
  197 | 
  198 |   // T2.5: Resenas vacias
  199 |   test('Caso 10: Visualizacion de resenas vacias', async ({ page }) => {
  200 |     await page.route('**/api/getReviews', async route => {
  201 |       await route.fulfill({
  202 |         status: 200,
  203 |         contentType: 'application/json',
  204 |         body: JSON.stringify({ data: [] })
  205 |       });
  206 |     });
  207 | 
  208 |     await doLogin(page);
  209 |     await expect(page.locator('text=No hay reseñas')).toBeVisible();
  210 |   });
  211 | });
  212 | 
```