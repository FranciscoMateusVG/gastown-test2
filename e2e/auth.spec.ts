import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  const testPassword = 'password123'

  test('unauthenticated user is redirected to /auth', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/auth')
  })

  test('can register a new user', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`
    await page.goto('/auth')

    // Switch to signup mode
    await page.getByText('Create account').click()

    // Fill registration form
    await page.getByLabel('Email').fill(testEmail)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    // Should redirect to items page
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible()
  })

  test('can login with valid credentials', async ({ page }) => {
    // First register a user
    const loginEmail = `login-${Date.now()}@example.com`

    await page.goto('/auth')
    await page.getByText('Create account').click()
    await page.getByLabel('Email').fill(loginEmail)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(page).toHaveURL('/')

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL('/auth')

    // Now login with the same credentials
    await page.getByLabel('Email').fill(loginEmail)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    // Should redirect to items page
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/auth')

    await page.getByLabel('Email').fill('nonexistent@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    // Should show error message and stay on auth page
    await expect(page.getByText('Invalid credentials')).toBeVisible()
    await expect(page).toHaveURL('/auth')
  })

  test('can logout and is redirected to /auth', async ({ page }) => {
    // Register and login
    const logoutEmail = `logout-${Date.now()}@example.com`

    await page.goto('/auth')
    await page.getByText('Create account').click()
    await page.getByLabel('Email').fill(logoutEmail)
    await page.getByLabel('Password').fill(testPassword)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(page).toHaveURL('/')

    // Click logout
    await page.getByRole('button', { name: 'Logout' }).click()

    // Should redirect to /auth
    await expect(page).toHaveURL('/auth')

    // Trying to access home should redirect to auth
    await page.goto('/')
    await expect(page).toHaveURL('/auth')
  })
})
