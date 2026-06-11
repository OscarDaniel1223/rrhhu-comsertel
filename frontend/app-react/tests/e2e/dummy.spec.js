import { test, expect } from '@playwright/test';

test.describe('Pruebas de infraestructura E2E', () => {
  test('deberia cargar una pagina en blanco y verificar el funcionamiento de Playwright', async ({ page }) => {
    await page.goto('about:blank');
    const url = page.url();
    expect(url).toBe('about:blank');
  });
});
