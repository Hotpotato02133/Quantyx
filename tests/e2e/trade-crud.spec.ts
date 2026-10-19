import { test, expect } from '@playwright/test'

test.describe('Trade Journal — CRUD flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('redirects unauthenticated users to sign-in', async ({ page }) => {
    await expect(page).toHaveURL(/sign-in/)
  })

  // NOTE: Authenticated E2E tests require a Clerk test instance.
  // Set up a test user and store credentials in environment variables:
  //   PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD
  //
  // These tests are marked as todo until auth is configured:
  test.todo('authenticated user sees the dashboard')
  test.todo('user can create a trade and it appears in the journal')
  test.todo('trade creation is optimistic — no spinner visible')
  test.todo('user can edit an existing trade')
  test.todo('user can delete a trade with confirmation')
  test.todo('filtering by direction hides opposing trades')
})
