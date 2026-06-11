import { test, expect } from '@playwright/test';

test.describe('Pruebas de Dashboard F2', () => {

  const doLogin = async (page) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'token-fake-admin',
          rol: 1,
          id: 1,
          name: 'Admin User',
          cambio_pass: 1,
          message: 'Bienvenido.'
        })
      });
    });

    await page.goto('/');
    await page.fill('input#email', 'admin@comsertel.com');
    await page.fill('input#password', 'password123');
    await page.click('button[type="submit"]');

    const confirmBtn = page.locator('.swal2-confirm');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    await expect(page).toHaveURL(/\/dashboard/);
  };

  test.beforeEach(async ({ page }) => {
    // Mockear endpoints comunes
    await page.route('**/api/getRegisterUsers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Usuarios registrados', icon: 'bi-people', count: 12, color: 'blue' }] })
      });
    });

    await page.route('**/api/getRegisterClients', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Clientes registrados', icon: 'bi-people', count: 5, color: 'green' }] })
      });
    });

    await page.route('**/api/getVentasMes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Ventas de este mes', icon: 'bi-cart', count: '$1,000.00', color: 'orange' }] })
      });
    });

    await page.route('**/api/getDailySales', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Ventas del dia', icon: 'bi-cash', count: '$50.00', color: 'purple' }] })
      });
    });

    await page.route('**/api/getVentasMesAnterior', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ name: 'Mes Anterior', value: 800 }, { name: 'Este Mes', value: 1000 }] })
      });
    });

    await page.route('**/api/sellsLastThreeMonths', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ name: 'Abril', value: 300 }, { name: 'Mayo', value: 400 }, { name: 'Junio', value: 500 }] })
      });
    });

    await page.route('**/api/CategoriesMostSold', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ name: 'Cat A', value: 10 }] })
      });
    });

    await page.route('**/api/getReviews', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 1, cliente: 'Cliente A', comentario: 'Excelente servicio', calificacion: 5 },
            { id: 2, cliente: 'Cliente B', comentario: 'Muy bueno', calificacion: 4 }
          ]
        })
      });
    });
  });

  // T1.1: Carga de tarjetas basicas
  test('Caso 1: Carga de tarjetas basicas de estadisticas', async ({ page }) => {
    await doLogin(page);
    await expect(page.locator('text=Usuarios registrados')).toBeVisible();
    await expect(page.locator('text=Clientes registrados')).toBeVisible();
    await expect(page.locator('text=Ventas de este mes')).toBeVisible();
    await expect(page.locator('text=Ventas del dia')).toBeVisible();
  });

  // T1.2: Grafico Ventas ultimos 3 meses
  test('Caso 2: Grafico Ventas ultimos 3 meses visible', async ({ page }) => {
    await doLogin(page);
    await expect(page.locator('text=Ventas ultimos 3 meses')).toBeVisible();
  });

  // T1.3: Top 5 categorias mas vendidas
  test('Caso 3: Grafico Top 5 categorias mas vendidas este mes visible', async ({ page }) => {
    await doLogin(page);
    await expect(page.locator('text=Top 5 categorias mas vendidas este mes')).toBeVisible();
  });

  // T1.4: Ingresos este mes vs mes anterior
  test('Caso 4: Grafico Ingresos este mes vs mes anterior visible', async ({ page }) => {
    await doLogin(page);
    await expect(page.locator('text=Ingresos este mes vs mes anterior')).toBeVisible();
  });

  // T1.5: Resenas de este mes
  test('Caso 5: Carga de tabla de resenas de este mes', async ({ page }) => {
    await doLogin(page);
    await expect(page.locator('text=Reseñas de este mes')).toBeVisible();
    await expect(page.locator('text=Cliente A')).toBeVisible();
    await expect(page.locator('text=Excelente servicio')).toBeVisible();
  });

  // T2.1: Pantallas super anchas (2560px)
  test('Caso 6: Dashboard estructurado en pantalla super ancha (2560px)', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await doLogin(page);
    await expect(page.locator('text=Usuarios registrados')).toBeVisible();
    await expect(page.locator('text=Ventas ultimos 3 meses')).toBeVisible();
  });

  // T2.2: Dispositivos moviles pequeños (320px) y menu hamburguesa
  test('Caso 7: Menu y dashboard adaptados a pantalla movil (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await doLogin(page);

    // Sidebar debe estar oculto inicialmente
    const sidebar = page.locator('div.fixed.top-0.left-0.h-screen.w-64');
    await expect(sidebar).toHaveClass(/translate-x-full/);

    // Boton hamburguesa debe estar visible
    const hamburger = page.locator('.lg\\:hidden.fixed.top-4.right-4');
    await expect(hamburger).toBeVisible();

    // Hacer clic en boton hamburguesa
    await hamburger.click();
    // Sidebar debe desplegarse
    await expect(sidebar).toHaveClass(/translate-x-0/);
  });

  // T2.3: Dashboard sin datos (tarjetas vacias o en 0)
  test('Caso 8: Comportamiento del Dashboard con datos vacios', async ({ page }) => {
    await page.route('**/api/getRegisterUsers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Usuarios registrados', icon: 'bi-people', count: 0, color: 'blue' }] })
      });
    });

    await doLogin(page);
    await expect(page.locator('text=Usuarios registrados')).toBeVisible();
    // Debe mostrar count en 0
    await expect(page.locator('text=Usuarios registrados').locator('xpath=../..').locator('text=0')).toBeVisible();
  });

  // T2.4: Dashboard con error de red en carga de estadisticas
  test('Caso 9: Dashboard con error de red simulado (500) en estadisticas', async ({ page }) => {
    await page.route('**/api/getRegisterUsers', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Error de servidor' })
      });
    });

    await doLogin(page);
    // Verificamos que la app siga de pie y muestre la estructura basica de estadisticas
    await expect(page.locator('text=Estadísticas')).toBeVisible();
  });

  // T2.5: Resenas vacias
  test('Caso 10: Visualizacion de resenas vacias', async ({ page }) => {
    await page.route('**/api/getReviews', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] })
      });
    });

    await doLogin(page);
    await expect(page.locator('text=No hay reseñas')).toBeVisible();
  });
});
