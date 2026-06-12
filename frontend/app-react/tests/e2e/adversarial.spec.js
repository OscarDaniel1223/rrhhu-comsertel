import { test, expect } from '@playwright/test';

test.describe('Pruebas Adversariales E2E - Tier 5', () => {

  test.beforeEach(async ({ page }) => {
    // Mockear las llamadas iniciales que se realizan en Home / Dashboard
    await page.route('**/api/getRegisterUsers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Usuarios', icon: 'bi-people', count: 12, color: 'blue' }] })
      });
    });
    await page.route('**/api/getRegisterClients', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Clientes', icon: 'bi-people', count: 5, color: 'green' }] })
      });
    });
    await page.route('**/api/getVentasMes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Ventas del Mes', icon: 'bi-cart', count: '$1000', color: 'orange' }] })
      });
    });
    await page.route('**/api/getDailySales', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Ventas Diarias', icon: 'bi-cash', count: '$50', color: 'purple' }] })
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
        body: JSON.stringify({ data: [] })
      });
    });
    await page.route('**/api/getRoles', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ id_rol: 1, rol: 'Administrador' }] })
      });
    });
  });

  // T5.1: Simulacion de error de red 500 al autenticar
  test('T5.1: Manejo de error de red 500 en el Login', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Error interno del servidor.' })
      });
    });

    await page.goto('/');
    await page.fill('input#email', 'error500@comsertel.com');
    await page.fill('input#password', 'cualquiera');
    await page.click('button[type="submit"]');

    // Debe mostrar la alerta SweetAlert2 indicando el error
    const alertModal = page.locator('.swal2-popup');
    await expect(alertModal).toBeVisible();
    await expect(alertModal).toContainText('Error');
    await page.click('.swal2-confirm');
  });

  // T5.2: Simulacion de inyeccion de script (XSS) en formularios
  test('T5.2: Inyeccion de script (XSS) en los campos de formulario de Login', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Credenciales incorrectas' })
      });
    });

    await page.goto('/');
    await page.fill('input#email', '"><script>alert("XSS")</script>@test.com');
    await page.fill('input#password', '\' OR 1=1 --');
    await page.click('button[type="submit"]');

    const alertModal = page.locator('.swal2-popup');
    await expect(alertModal).toBeVisible();
    await page.click('.swal2-confirm');
  });

  // T5.3: Simulacion de caida de red (desconexion total) al guardar usuario
  test('T5.3: Caida de red (desconexion) al autenticar usuario', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.abort('failed');
    });

    await page.goto('/');
    await page.fill('input#email', 'disconnect@comsertel.com');
    await page.fill('input#password', 'password');
    await page.click('button[type="submit"]');

    const alertModal = page.locator('.swal2-popup');
    await expect(alertModal).toBeVisible();
  });

  // T5.4: Datos nulos o corruptos en la respuesta de estadisticas (Dashboard)
  test('T5.4: Datos corruptos / vacios en graficos y estadisticas', async ({ page }) => {
    await page.route('**/api/getRegisterUsers', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) });
    });
    await page.route('**/api/sellsLastThreeMonths', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'token-fake', rol: 1, id: 1, name: 'Test User', cambio_pass: 1 })
      });
    });

    await page.goto('/');
    await page.fill('input#email', 'user@comsertel.com');
    await page.fill('input#password', 'password');
    await page.click('button[type="submit"]');
    await page.click('.swal2-confirm');

    await expect(page).toHaveURL(/\/dashboard/);
    
    const dashboardTitle = page.locator('h2:has-text("Estadísticas")');
    await expect(dashboardTitle).toBeVisible();
  });
});
