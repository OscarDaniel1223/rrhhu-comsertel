import { test, expect } from '@playwright/test';

test.describe('Pruebas de Empleados F3', () => {

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

    // Mockear cargos
    await page.route('**/api/cargos', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'success',
          data: [
            { id: 1, titulo: 'Desarrollador', departamento: 'Sistemas' },
            { id: 2, titulo: 'Contador', departamento: 'Contabilidad' }
          ]
        })
      });
    });

    // Mockear lista de empleados
    await page.route('**/api/empleados', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            data: [
              { id: 1, nombres: 'Carlos', apellidos: 'Perez', dui: '12345678-9', nit: '1234-567890-123-4', departamento: 'Sistemas', cargo: 'Desarrollador', salario_base: 1500, estado: 'ACTIVO' },
              { id: 2, nombres: 'Ana', apellidos: 'Gomez', dui: '87654321-0', nit: '4321-098765-321-0', departamento: 'Contabilidad', cargo: 'Contador', salario_base: 1200, estado: 'ACTIVO' }
            ]
          })
        });
      }
    });
  });

  const navigateToEmployees = async (page) => {
    await doLogin(page);
    await page.click('button:has-text("Empleados")');
  };

  test('Caso 1: Visualizacion de la lista de colaboradores', async ({ page }) => {
    await navigateToEmployees(page);
    await expect(page.locator('text=Gestión de Empleados')).toBeVisible();
    await expect(page.locator('text=Carlos Perez')).toBeVisible();
    await expect(page.locator('text=Ana Gomez')).toBeVisible();
  });

  test('Caso 2: Acceso al formulario de registro de empleado', async ({ page }) => {
    await navigateToEmployees(page);
    await page.click('button:has-text("Registrar Empleado")');
    await expect(page.locator('text=Registro de Nuevo Empleado')).toBeVisible();
    await expect(page.locator('input[name="nombres"]')).toBeVisible();
  });

  test('Caso 3: Registro exitoso de colaborador', async ({ page }) => {
    await page.route('**/api/empleados', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success', message: 'Empleado registrado correctamente.' })
        });
      }
    });

    await navigateToEmployees(page);
    await page.click('button:has-text("Registrar Empleado")');

    await page.fill('input[name="nombres"]', 'Luis Alberto');
    await page.fill('input[name="apellidos"]', 'Martínez');
    await page.fill('input[name="dui"]', '11223344-5');
    await page.fill('input[name="nit"]', '1122-334455-667-8');
    await page.fill('input[name="fecha_ingreso"]', '2026-06-01');
    await page.selectOption('select[name="id_cargo"]', '1');
    await page.selectOption('select[name="estado"]', 'ACTIVO');

    await page.click('button[type="submit"]');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('Empleado registrado correctamente.');
    await page.click('.swal2-confirm');
  });

  test('Caso 4: Filtrado dinámico por buscador', async ({ page }) => {
    await navigateToEmployees(page);
    const searchInput = page.locator('input[placeholder="Buscar por nombre, DUI, cargo..."]');
    await expect(searchInput).toBeVisible();

    await searchInput.fill('Carlos');
    await expect(page.locator('text=Carlos Perez')).toBeVisible();
    await expect(page.locator('text=Ana Gomez')).not.toBeVisible();
  });

  test('Caso 5: Filtrado dinámico por departamento', async ({ page }) => {
    await navigateToEmployees(page);
    const selectDpto = page.locator('select:has-text("Todos los Departamentos")');
    await expect(selectDpto).toBeVisible();

    await selectDpto.selectOption('Sistemas');
    await expect(page.locator('text=Carlos Perez')).toBeVisible();
    await expect(page.locator('text=Ana Gomez')).not.toBeVisible();
  });

  test('Caso 6: Alerta por DUI con formato inválido', async ({ page }) => {
    await navigateToEmployees(page);
    await page.click('button:has-text("Registrar Empleado")');

    await page.fill('input[name="nombres"]', 'Jose');
    await page.fill('input[name="apellidos"]', 'Rivas');
    await page.fill('input[name="dui"]', '12345');
    await page.fill('input[name="nit"]', '1122-334455-667-8');
    await page.fill('input[name="fecha_ingreso"]', '2026-06-01');
    await page.selectOption('select[name="id_cargo"]', '1');

    await page.click('button[type="submit"]');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-title')).toContainText('DUI Inválido');
    await page.click('.swal2-confirm');
  });

  test('Caso 7: Alerta por NIT con formato inválido', async ({ page }) => {
    await navigateToEmployees(page);
    await page.click('button:has-text("Registrar Empleado")');

    await page.fill('input[name="nombres"]', 'Jose');
    await page.fill('input[name="apellidos"]', 'Rivas');
    await page.fill('input[name="dui"]', '12345678-9');
    await page.fill('input[name="nit"]', '1234');
    await page.fill('input[name="fecha_ingreso"]', '2026-06-01');
    await page.selectOption('select[name="id_cargo"]', '1');

    await page.click('button[type="submit"]');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-title')).toContainText('NIT Inválido');
    await page.click('.swal2-confirm');
  });

  test('Caso 8: Mensaje de aviso cuando la lista está vacía', async ({ page }) => {
    await page.route('**/api/empleados', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [] })
      });
    });

    await navigateToEmployees(page);
    await expect(page.locator('text=No se encontraron colaboradores')).toBeVisible();
  });

  test('Caso 9: Eliminación (desactivación) de colaborador', async ({ page }) => {
    await page.route('**/api/empleados/1', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success', message: 'El estado del empleado ha sido actualizado.' })
        });
      }
    });

    await navigateToEmployees(page);
    await page.locator('button[title="Desactivar o Eliminar"]').first().click();

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.click('.swal2-confirm');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('El estado del empleado ha sido actualizado.');
    await page.click('.swal2-confirm');
  });

  test('Caso 10: Responsividad de la lista de colaboradores en movil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await navigateToEmployees(page);

    const header = page.locator('div.hidden.md\\:flex.items-center');
    await expect(header).not.toBeVisible();

    const labelDui = page.locator('text=DUI').first();
    await expect(labelDui).toBeVisible();
  });
});
