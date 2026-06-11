import { test, expect } from '@playwright/test';

test.describe('Pruebas Combinadas de Caracteristicas Tier 3', () => {

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
    await page.waitForTimeout(500); // Esperar a que React se estabilice tras la redireccion
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
            { id_rol: 1, rol: 'Administrador' }
          ]
        })
      });
    });

    // Mockear cargos
    await page.route('**/api/cargos', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: [{ id: 1, titulo: 'Desarrollador', departamento: 'Sistemas' }]
        })
      });
    });

    // Mockear empleados
    await page.route('**/api/empleados', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: [{ id: 1, nombres: 'Carlos', apellidos: 'Perez', dui: '12345678-9', nit: '1234-567890-123-4', departamento: 'Sistemas', cargo: 'Desarrollador', salario_base: 1500, estado: 'ACTIVO' }]
        })
      });
    });

    // Mockear usuarios
    await page.route('**/api/getUsuarios', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ id_usuario: 1, nombre: 'Admin User', email: 'admin@comsertel.com', rol: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' }]
        })
      });
    });
  });

  test('T3.1: Login -> Cambio de tema (Dark Mode) -> Navegacion -> Validacion visual', async ({ page }) => {
    await doLogin(page);

    const themeBtn = page.locator('button:has-text("Modo Claro"), button:has-text("Modo Oscuro")');
    await expect(themeBtn).toBeVisible();

    await themeBtn.click();
    await expect(themeBtn).toContainText('Modo Claro');

    await page.click('button:has-text("Dashboard")');
    await expect(page.locator('text=Estadísticas')).toBeVisible();
  });

  test('T3.2: Login -> Usuarios -> Modal -> Edicion -> Refresco de tabla', async ({ page }) => {
    let callCount = 0;
    await page.route('**/api/getUsuarios', async route => {
      callCount++;
      if (callCount === 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{ id_usuario: 1, text: 'ref1', nombre: 'Admin User', email: 'admin@comsertel.com', rol: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' }]
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{ id_usuario: 1, text: 'ref2', nombre: 'Admin Modificado', email: 'admin@comsertel.com', rol: 'Administrador', idrol: 1, estado: 1, telefono: '12345678', numero_documento: '123456789' }]
          })
        });
      }
    });

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

    await doLogin(page);
    await page.click('button:has-text("Lista de usuarios")');

    await page.click('button:has-text("Editar")');
    await page.fill('input#nombre_edit', 'Admin Modificado');
    await page.click('#form_edit_user button[type="submit"]');

    await page.click('.swal2-confirm');
    await page.click('.swal2-confirm');

    await expect(page.locator('text=Admin Modificado')).toBeVisible();
  });

  test('T3.3: Login -> Empleados -> Filtrado -> Cierre de sesion', async ({ page }) => {
    await doLogin(page);
    await page.click('button:has-text("Empleados")');

    const searchInput = page.locator('input[placeholder="Buscar por nombre, DUI, cargo..."]');
    await searchInput.fill('Carlos');
    await expect(page.locator('text=Carlos Perez')).toBeVisible();

    await page.click('button:has-text("Cerrar sesion")');
    await page.click('.swal2-confirm');

    await expect(page).toHaveURL(/\//);
  });

  test('T3.4: Login -> Modales multiples -> Cierre con ESC -> Persistencia de sesion', async ({ page }) => {
    await doLogin(page);
    await page.click('button:has-text("Lista de usuarios")');

    await page.click('button:has-text("Agregar")');
    const modal = page.locator('.modal-dialog');
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
