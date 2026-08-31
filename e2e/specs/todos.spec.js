const { test, expect } = require('@playwright/test');

// Primary journey: sign in and create/list a todo through the real UI against the
// running stack (spec 007 / T019, SC-004).
test('a user signs in and creates a todo', async ({ page }) => {
  await page.goto('/');

  // Log in with a seeded credential (auth-api allows admin_admin; users-api seeds admin).
  await page.getByPlaceholder('johnd').fill('admin');
  await page.getByPlaceholder('foo').fill('admin');
  await page.getByRole('button', { name: /login/i }).click();

  // The todos view exposes the "New task" input once authenticated.
  const newTask = page.getByPlaceholder('New task');
  await expect(newTask).toBeVisible();

  const item = `e2e todo ${Date.now()}`;
  await newTask.fill(item);
  await page.getByRole('button', { name: /add todo/i }).click();

  await expect(page.getByText(item)).toBeVisible();
});

// Failure journey: a browser must turn a transport failure into an actionable
// message instead of leaving the spinner running or exposing a raw exception.
test('a user sees a bounded error when the todos API is unavailable', async ({ page }) => {
  await page.goto('/');
  await page.route('**/todos', route => route.abort('connectionrefused'));

  await page.getByPlaceholder('johnd').fill('admin');
  await page.getByPlaceholder('foo').fill('admin');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(page.getByText(/service temporarily unavailable/i)).toBeVisible();
  await expect(page.getByText(/backend socket|failed to fetch/i)).toHaveCount(0);
});
