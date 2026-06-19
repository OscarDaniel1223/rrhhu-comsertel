import { test, expect } from '@playwright/test';

test.describe('Pruebas de Usuarios F4', () => {

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
    // Mockear endpoints comunes del dashboard con datos para evitar crash
    await page.route('**/api/getRegisterUsers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Usuarios', icon: 'bi-people', count: 0, color: 'blue' }] })
      });
    });
    await page.route('**/api/getRegisterClients', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Clientes', icon: 'bi-people', count: 0, color: 'green' }] })
      });
    });
    await page.route('**/api/getVentasMes', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Ventas Mes', icon: 'bi-cart', count: 0, color: 'orange' }] })
      });
    });
    await page.route('**/api/getDailySales', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [{ title: 'Ventas Diarias', icon: 'bi-cash', count: 0, color: 'purple' }] })
      });
    });
    await page.route('**/api/getVentasMesAnterior', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/api/sellsLastThreeMonths', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/api/CategoriesMostSold', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });
    await page.route('**/api/getReviews', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    // Mockear roles
    await page.route('**/api/getRoles', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id_rol: 1, rol: 'Administrador' },
            { id_rol: 3, rol: 'Recursos Humanos' }
          ]
        })
      });
    });

    // Mockear usuarios getUsuarios
    await page.route('**/api/getUsuarios', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id_usuario: 1, nombre: 'Admin User', email: 'admin@comsertel.com', rol: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' },
          { id_usuario: 2, nombre: 'RRHH User', email: 'rrhh@comsertel.com', rol: 'Recursos Humanos', idrol: 3, estado: 1, telefono: '87654321', numero_documento: '987654321' }
        ])
      });
    });
  });

  const navigateToUsers = async (page) => {
    await doLogin(page);
    await page.click('button:has-text("Lista de usuarios")');
  };

  test('Caso 1: Visualizacion de la lista de usuarios', async ({ page }) => {
    await navigateToUsers(page);
    await expect(page.locator('text=Gestion de Usuarios')).toBeVisible();
    await expect(page.locator('text=Admin User')).toBeVisible();
    await expect(page.locator('text=RRHH User')).toBeVisible();
  });

  test('Caso 2: Filtrado por rol de usuario', async ({ page }) => {
    await navigateToUsers(page);
    const rolFilter = page.locator('.select_custom').first();
    await expect(rolFilter).toBeVisible();
  });

  test('Caso 3: Filtrado por estado de usuario', async ({ page }) => {
    await navigateToUsers(page);
    const estadoFilter = page.locator('.select_custom').nth(1);
    await expect(estadoFilter).toBeVisible();
  });

  test('Caso 4: Apertura del modal de agregar usuario', async ({ page }) => {
    await navigateToUsers(page);
    await page.click('button:has-text("Agregar")');
    await expect(page.locator('.modal-title')).toContainText('Agregar Usuario');
    await expect(page.locator('input#nombres')).toBeVisible();
  });

  test('Caso 5: Apertura del modal de edicion de usuario', async ({ page }) => {
    await page.route('**/api/getUser*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 200,
          data: { id_usuario: 1, nombre: 'Admin User', email: 'admin@comsertel.com', rol_nombre: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' }
        })
      });
    });

    await navigateToUsers(page);
    await page.click('button:has-text("Editar")');
    await expect(page.locator('.modal-title')).toContainText('Editar Usuario');
    await expect(page.locator('input#nombre_edit')).toHaveValue('Admin User');
  });

  test('Caso 6: Alerta por envio de formulario agregar vacio', async ({ page }) => {
    await navigateToUsers(page);
    await page.click('button:has-text("Agregar")');
    await page.click('#btn_submit');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('Ingrese nombres');
    await page.click('.swal2-confirm');
  });

  test('Caso 7: Alerta por email con formato inválido', async ({ page }) => {
    await navigateToUsers(page);
    await page.click('button:has-text("Agregar")');

    await page.fill('input#nombres', 'Luis Alfonso');
    await page.fill('input#apellidos', 'Mejia');
    await page.fill('input#email', 'correo-invalido');
    await page.fill('input#numero_documento', '123456789');
    await page.fill('input#telefono', '77665544');

    await page.click('#btn_submit');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('Correo debe tener un formato valido');
    await page.click('.swal2-confirm');
  });

  test('Caso 8: Guardado exitoso de edicion de usuario', async ({ page }) => {
    await page.route('**/api/getUser*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 200,
          data: { id_usuario: 1, nombre: 'Admin User', email: 'admin@comsertel.com', rol_nombre: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' }
        })
      });
    });

    await page.route('**/api/updateUser', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 200, message: 'Usuario actualizado con éxito' })
      });
    });

    await navigateToUsers(page);
    await page.click('button:has-text("Editar")');

    await page.fill('input#nombre_edit', 'Admin Modificado');
    await page.click('#form_edit_user button[type="submit"]');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.click('.swal2-confirm');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('Usuario actualizado con éxito');
    await page.click('.swal2-confirm');
  });

  test('Caso 9: Flujo de eliminacion y posterior activacion de usuario', async ({ page }) => {
    await page.route('**/api/getUsuarios', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id_usuario: 1, nombre: 'Admin User', email: 'admin@comsertel.com', rol: 'Administrador', idrol: 1, estado: 0, telefono: '12345678', numero_documento: '123456789' }
        ])
      });
    });

    await page.route('**/api/activarUsuario', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 200, message: 'Usuario activado con éxito' })
      });
    });

    await navigateToUsers(page);

    const activateBtn = page.locator('button:has-text("Activar")');
    await expect(activateBtn).toBeVisible();

    await activateBtn.click();

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.click('.swal2-confirm');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('Usuario activado con éxito');
    await page.click('.swal2-confirm');
  });

  test('Caso 10: Modal usable tras redimensionar viewport', async ({ page }) => {
    await navigateToUsers(page);
    await page.click('button:has-text("Agregar")');

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('input#nombres')).toBeInViewport();

    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('input#nombres')).toBeInViewport();
  });
});
