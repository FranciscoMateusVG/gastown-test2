import { test, expect } from '@playwright/test'

test.describe('Items CRUD', () => {
  const testPassword = 'password123'

  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    await page.goto('/auth')

    // Check if already logged in (redirected to home)
    if (page.url().endsWith('/')) {
      return
    }

    // Register new user for this test
    await page.getByText('Create account').click()
    await page.getByLabel('Email').fill(`items-${Date.now()}-${Math.random()}@example.com`)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(page).toHaveURL('/')
  })

  test('can create an item', async ({ page }) => {
    const itemName = `Test Item ${Date.now()}`

    // Fill in the form and submit
    await page.getByPlaceholder('What needs to be added?').fill(itemName)
    await page.getByRole('button', { name: 'Add' }).click()

    // Item should appear in the list
    await expect(page.getByText(itemName)).toBeVisible()
  })

  test('can delete an item', async ({ page }) => {
    const itemName = `Delete Me ${Date.now()}`

    // Create an item first
    await page.getByPlaceholder('What needs to be added?').fill(itemName)
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByText(itemName)).toBeVisible()

    // Find the item row and click delete
    const itemRow = page.locator('li').filter({ hasText: itemName })
    await itemRow.getByRole('button', { name: /Delete/ }).click()

    // Item should be removed from the list
    await expect(page.getByText(itemName)).not.toBeVisible()
  })

  test('shows item count in footer after adding items', async ({ page }) => {
    const itemName = `Footer Test ${Date.now()}`

    // Add an item
    await page.getByPlaceholder('What needs to be added?').fill(itemName)
    await page.getByRole('button', { name: 'Add' }).click()
    await expect(page.getByText(itemName)).toBeVisible()

    // Footer should show item count (at least 1 item exists)
    await expect(page.locator('text=/\\d+ items?/')).toBeVisible()
  })
})
