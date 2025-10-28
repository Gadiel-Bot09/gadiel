import { expect, test } from '@playwright/test';

const API = 'http://localhost:3000/api';

const PRODUCT_ID = 'prod-1';

test.describe('Gestión de productos', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(`${API}/licenses/status`, (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ state: 'active', plan: 'pro', expiresAt: new Date().toISOString(), daysRemaining: 30 }),
        headers: { 'content-type': 'application/json' },
      }),
    );

    await page.route(`${API}/products`, (route, request) => {
      if (request.method() === 'GET') {
        route.fulfill({
          status: 200,
          body: JSON.stringify([{ id: PRODUCT_ID, name: 'Capuchino', price: 7500, taxable: true }]),
          headers: { 'content-type': 'application/json' },
        });
      } else if (request.method() === 'POST') {
        route.fulfill({
          status: 201,
          body: JSON.stringify({ id: 'prod-2', ...(JSON.parse(request.postData() ?? '{}')) }),
          headers: { 'content-type': 'application/json' },
        });
      } else if (request.method() === 'PATCH') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ id: PRODUCT_ID, ...(JSON.parse(request.postData() ?? '{}')) }),
          headers: { 'content-type': 'application/json' },
        });
      } else if (request.method() === 'DELETE') {
        route.fulfill({
          status: 200,
          body: JSON.stringify({ success: true }),
          headers: { 'content-type': 'application/json' },
        });
      }
    });
  });

  test('crear, editar y eliminar producto', async ({ page }) => {
    await page.goto('/productos');

    await expect(page.getByRole('heading', { name: 'Productos' })).toBeVisible();

    await page.getByRole('button', { name: 'Nuevo producto' }).click();
    await page.getByLabel('Nombre').fill('Latte Vainilla');
    await page.getByLabel('Precio (COP)').fill('9000');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByText('Latte Vainilla')).toBeVisible();

    await page.getByRole('button', { name: 'Editar' }).first().click();
    const priceInput = page.getByLabel('Precio (COP)');
    await priceInput.fill('9500');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText(/9\.500,00 COP/)).toBeVisible();

    await page.getByRole('button', { name: 'Eliminar' }).first().click();
    await page.getByPlaceholder('Escribe ELIMINAR').fill('ELIMINAR');
    await page.getByRole('button', { name: 'Eliminar definitivamente' }).click();

    await expect(page.getByText('Latte Vainilla')).not.toBeVisible({ timeout: 2000 });
  });
});
