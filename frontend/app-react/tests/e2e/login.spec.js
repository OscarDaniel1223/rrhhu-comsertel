import { test, expect } from '@playwright/test';

test.describe('Pruebas de Login F1', () => {

  test.beforeEach(async ({ page }) => {
    // Configurar rutas comunes mockeadas
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

  // T1.1: Visualizacion del formulario
  test('Caso 1: Visualizacion del formulario de login', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('INGRESAR');
  });

  // T1.2: Login exitoso con rol Admin (Rol 1)
  test('Caso 2: Login exitoso con rol Admin (Rol 1)', async ({ page }) => {
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

    // Debe mostrar la alerta SweetAlert2 y redirigir
    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.click('.swal2-confirm');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  // T1.3: Login exitoso con rol RRHH (Rol 3)
  test('Caso 3: Login exitoso con rol RRHH (Rol 3)', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'token-fake-rrhh',
          rol: 3,
          id: 3,
          name: 'RRHH User',
          cambio_pass: 1,
          message: 'Bienvenido.'
        })
      });
    });

    await page.goto('/');
    await page.fill('input#email', 'rrhh@comsertel.com');
    await page.fill('input#password', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.click('.swal2-confirm');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  // T1.4: Logout exitoso
  test('Caso 4: Logout exitoso con confirmacion', async ({ page }) => {
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
    await page.click('.swal2-confirm');

    // Hacer clic en Cerrar sesion en el navbar
    await page.click('button:has-text("Cerrar sesion")');
    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.click('.swal2-confirm');

    await expect(page).toHaveURL(/\//);
  });

  // T1.5: Persistencia de sesion en recarga
  test('Caso 5: Persistencia de sesion tras recarga de pagina', async ({ page }) => {
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
    await page.click('.swal2-confirm');

    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // T2.1: Campos vacios
  test('Caso 6: Error al intentar enviar campos vacios', async ({ page }) => {
    await page.goto('/');
    // Intentar submit directamente
    await page.click('button[type="submit"]');

    // Sweetalert2 debe mostrar el mensaje de validacion
    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('Por favor, completa todos los campos.');
    await page.click('.swal2-confirm');
  });

  // T2.2: Credenciales incorrectas
  test('Caso 7: Error con credenciales incorrectas', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Error al iniciar sesion. Por favor, intentalo de nuevo.'
        })
      });
    });

    await page.goto('/');
    await page.fill('input#email', 'incorrecto@comsertel.com');
    await page.fill('input#password', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('Error al iniciar sesion');
    await page.click('.swal2-confirm');
  });

  // T2.3: Cambio de contrasena temporal (cambio_pass: 0)
  test('Caso 8: Cambio de contrasena temporal requerido', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'token-fake-temp',
          rol: 1,
          id: 10,
          name: 'Temp User',
          cambio_pass: 0
        })
      });
    });

    await page.route('**/api/change-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 200,
          message: 'Contraseña actualizada correctamente.'
        })
      });
    });

    await page.goto('/');
    await page.fill('input#email', 'temp@comsertel.com');
    await page.fill('input#password', 'temp123');
    await page.click('button[type="submit"]');

    // Debe abrir el modal de cambio de contrasena
    const modal = page.locator('#form_change_password');
    await expect(modal).toBeVisible();

    // Llenar el formulario del modal
    await page.fill('#temp_password', 'temp123');
    await page.fill('#new_password', 'NuevaContra123');
    await page.fill('#confirm_password', 'NuevaContra123');

    // Interceptar la alerta nativa del navegador en caso de que ocurra (LoginForm.jsx:54 tiene un alert(id))
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await page.click('#form_change_password button[type="submit"]');

    // Debe mostrar la alerta SweetAlert2 de exito
    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('Contraseña actualizada correctamente.');
    await page.click('.swal2-confirm');
  });

  // T2.4: Intento de inyeccion en campos de login
  test('Caso 9: Intento de inyeccion de codigo en campos', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Error al iniciar sesion. Por favor, intentalo de nuevo.'
        })
      });
    });

    await page.goto('/');
    await page.fill('input#email', "' OR 1=1 --");
    await page.fill('input#password', '<script>alert(1)</script>');
    await page.click('button[type="submit"]');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.click('.swal2-confirm');
  });

  // T2.5: Responsividad en dispositivos moviles (320px)
  test('Caso 10: Responsividad del login en pantalla movil (320px)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
  });
});
