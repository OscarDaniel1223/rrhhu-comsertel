import { test, expect } from '@playwright/test';

test.describe('Pruebas de Escenarios de la Vida Real Tier 4', () => {

  test.beforeEach(async ({ page }) => {
    // Evitar fallos del dashboard con datos de estadisticas validos
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
  });

  test('T4.1: Flujo completo de administracion', async ({ page }) => {
    let empCallCount = 0;
    await page.route('**/api/empleados', async route => {
      if (route.request().method() === 'GET') {
        empCallCount++;
        if (empCallCount === 1) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'success', data: [] })
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              status: 'success',
              data: [{ id: 1, nombres: 'Colaborador', apellidos: 'Nuevo', dui: '12345678-9', nit: '1234-567890-123-4', departamento: 'Sistemas', cargo: 'Desarrollador', salario_base: 1500, estado: 'ACTIVO' }]
            })
          });
        }
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success', message: 'Empleado registrado correctamente.' })
        });
      }
    });

    await page.route('**/api/getUsuarios', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [{ id_usuario: 2, nombre: 'Colaborador Nuevo', email: 'colab@comsertel.com', rol: 'Recursos Humanos', idrol: 3, estado: 1, telefono: '12345678', numero_documento: '123456789' }]
        })
      });
    });

    await page.route('**/api/getUser*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 200,
          data: { id_usuario: 2, nombre: 'Colaborador Nuevo', email: 'colab@comsertel.com', rol_nombre: 'Recursos Humanos', idrol: 3, estado: 1, telefono: '12345678', numero_documento: '123456789' }
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

    // 1. Login admin
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-admin', rol: 1, id: 1, name: 'Admin', cambio_pass: 1, message: 'Bienvenido.' })
      });
    });
    await page.goto('/');
    await page.fill('input#email', 'admin@comsertel.com');
    await page.fill('input#password', 'password');
    await page.click('button[type="submit"]');

    const confirmBtn = page.locator('.swal2-confirm');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(500);

    // 2. Creacion de empleado
    await page.click('button:has-text("Empleados")');
    await page.click('button:has-text("Registrar Empleado")');
    await page.fill('input[name="nombres"]', 'Colaborador');
    await page.fill('input[name="apellidos"]', 'Nuevo');
    await page.fill('input[name="dui"]', '12345678-9');
    await page.fill('input[name="nit"]', '1234-567890-123-4');
    await page.fill('input[name="fecha_ingreso"]', '2026-06-01');
    await page.selectOption('select[name="id_cargo"]', '1');
    await page.click('button[type="submit"]');

    const empConfirm = page.locator('.swal2-confirm');
    await expect(empConfirm).toBeVisible();
    await empConfirm.click();

    // 3. Verificacion en tabla
    await page.click('button:has-text("Tabla de Empleados")');
    await expect(page.locator('text=Colaborador Nuevo')).toBeVisible();

    // 4. Edicion de rol
    await page.click('button:has-text("Lista de usuarios")');
    await page.click('button:has-text("Editar")');
    await page.click('#form_edit_user button[type="submit"]');

    const editConfirm = page.locator('.swal2-confirm');
    await expect(editConfirm).toBeVisible();
    await editConfirm.click();

    const editSuccess = page.locator('.swal2-confirm');
    await expect(editSuccess).toBeVisible();
    await editSuccess.click();

    // 5. Logout
    await page.click('button:has-text("Cerrar sesion")');
    const logoutConfirm = page.locator('.swal2-confirm');
    await expect(logoutConfirm).toBeVisible();
    await logoutConfirm.click();

    await expect(page).toHaveURL(/\//);
  });

  test('T4.2: Auditoria de interfaz responsive en movil (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-admin', rol: 1, id: 1, name: 'Admin', cambio_pass: 1, message: 'Bienvenido.' })
      });
    });

    await page.route('**/api/getUsuarios', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.route('**/api/newUser', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 200, message: 'Usuario creado con éxito' })
      });
    });

    await page.goto('/');
    await page.fill('input#email', 'admin@comsertel.com');
    await page.fill('input#password', 'password');
    await page.click('button[type="submit"]');

    const confirmBtn = page.locator('.swal2-confirm');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(500);

    const sidebar = page.locator('div.fixed.top-0.left-0.h-screen.w-64');
    await expect(sidebar).toHaveClass(/translate-x-full/);

    const hamburger = page.locator('.lg\\:hidden.fixed.top-4.right-4');
    await hamburger.click();
    await expect(sidebar).toHaveClass(/translate-x-0/);

    await page.click('button:has-text("Lista de usuarios")');

    await page.click('button:has-text("Agregar")');
    await expect(page.locator('.modal-title')).toContainText('Agregar Usuario');

    await page.fill('input#nombres', 'Luis Movil');
    await page.fill('input#apellidos', 'Sanchez');
    await page.fill('input#email', 'luismovil@comsertel.com');
    await page.fill('input#numero_documento', '123456789');
    await page.fill('input#telefono', '77665544');
    await page.fill('input#password', 'temporal123');

    await page.click('#form_new_user .css-art250-ValueContainer');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.click('#btn_submit');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.click('.swal2-confirm');
  });

  test('T4.3: Flujo de visualizacion de metricas en modo oscuro y claro', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-admin', rol: 1, id: 1, name: 'Admin', cambio_pass: 1, message: 'Bienvenido.' })
      });
    });

    await page.goto('/');
    await page.fill('input#email', 'admin@comsertel.com');
    await page.fill('input#password', 'password');
    await page.click('button[type="submit"]');

    const confirmBtn = page.locator('.swal2-confirm');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(500);

    await expect(page.locator('text=Usuarios')).toBeVisible();
    await expect(page.locator('text=Ventas ultimos 3 meses')).toBeVisible();

    const themeBtn = page.locator('button:has-text("Modo Oscuro")');
    await themeBtn.click();
    await expect(page.locator('button:has-text("Modo Claro")')).toBeVisible();

    const themeBtnClaro = page.locator('button:has-text("Modo Claro")');
    await themeBtnClaro.click();
    await expect(page.locator('button:has-text("Modo Oscuro")')).toBeVisible();
  });

  test('T4.4: Resiliencia ante error de red (500) al guardar usuario', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-admin', rol: 1, id: 1, name: 'Admin', cambio_pass: 1, message: 'Bienvenido.' })
      });
    });

    await page.route('**/api/getUsuarios', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.route('**/api/newUser', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Error de comunicacion con el servidor' })
      });
    });

    await page.goto('/');
    await page.fill('input#email', 'admin@comsertel.com');
    await page.fill('input#password', 'password');
    await page.click('button[type="submit"]');

    const confirmBtn = page.locator('.swal2-confirm');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(500);

    await page.click('button:has-text("Lista de usuarios")');
    await page.click('button:has-text("Agregar")');

    await page.fill('input#nombres', 'Luis Resiliente');
    await page.fill('input#apellidos', 'Rivas');
    await page.fill('input#email', 'luisres@comsertel.com');
    await page.fill('input#numero_documento', '123456789');
    await page.fill('input#telefono', '77665544');
    await page.fill('input#password', 'temporal123');

    await page.click('#form_new_user .css-art250-ValueContainer');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.click('#btn_submit');

    await expect(page.locator('.swal2-popup')).toBeVisible();
    await expect(page.locator('.swal2-html-container')).toContainText('Error al crear el usuario');
    await page.click('.swal2-confirm');

    await expect(page.locator('#btn_submit')).toBeEnabled();
  });

  test('T4.5: Flujo de navegacion intensiva sin recarga de pagina', async ({ page }) => {
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'fake-admin', rol: 1, id: 1, name: 'Admin', cambio_pass: 1, message: 'Bienvenido.' })
      });
    });

    await page.route('**/api/empleados', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: [] }) });
    });
    await page.route('**/api/getUsuarios', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.goto('/');
    await page.fill('input#email', 'admin@comsertel.com');
    await page.fill('input#password', 'password');
    await page.click('button[type="submit"]');

    const confirmBtn = page.locator('.swal2-confirm');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(500);

    await page.click('button:has-text("Empleados")');
    await expect(page.locator('text=Gestión de Empleados')).toBeVisible();

    await page.click('button:has-text("Registrar Empleado")');
    await expect(page.locator('text=Registro de Nuevo Empleado')).toBeVisible();

    await page.click('button:has-text("Tabla de Empleados")');
    await expect(page.locator('text=Tabla de Empleados')).toBeVisible();

    await page.click('button:has-text("Lista de usuarios")');
    await expect(page.locator('text=Gestion de Usuarios')).toBeVisible();

    await page.click('button:has-text("Dashboard")');
    await expect(page.locator('text=Estadísticas')).toBeVisible();
  });
});
