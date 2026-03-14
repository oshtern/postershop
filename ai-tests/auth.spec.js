/**
 * Authentication Tests
 * Tests for user registration, login, and logout flows
 */

import { test, expect } from '@playwright/test';
import { generateTestEmail, registerUser, loginUser, clearSession } from './utils';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login');
  });

  test.describe('User Registration', () => {
    test('should successfully register a new user', async ({ page }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Navigate to register page
      await page.goto('/register');

      // Fill in registration form
      await page.locator('input[placeholder="Name"]').fill(name);
      await page.locator('input[placeholder="Email"]').fill(email);
      await page.locator('input[placeholder*="Password"]').fill(password);

      // Submit form
      await page.locator('button:has-text("Create account")').click();

      // Wait for redirect to home page
      await page.waitForURL('**/');

      // Verify user is logged in by checking header
      await expect(page.locator('header')).toContainText(name);
    });

    test('should display error for duplicate email', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register first user via API
      await registerUser(context, name, email, password);

      // Navigate to register page
      await page.goto('/register');

      // Try to register with same email
      await page.locator('input[placeholder="Name"]').fill('Another User');
      await page.locator('input[placeholder="Email"]').fill(email);
      await page.locator('input[placeholder*="Password"]').fill(password);

      // Submit form
      await page.locator('button:has-text("Create account")').click();

      // Verify error message is displayed
      await expect(page.locator('p[style*="crimson"]')).toBeVisible();
      await expect(page.locator('p[style*="crimson"]')).toContainText('Email already registered');
    });

    test('should display error for password too short', async ({ page }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'short'; // Less than 8 characters

      // Navigate to register page
      await page.goto('/register');

      // Fill in registration form
      await page.locator('input[placeholder="Name"]').fill(name);
      await page.locator('input[placeholder="Email"]').fill(email);
      await page.locator('input[placeholder*="Password"]').fill(password);

      // Submit form
      await page.locator('button:has-text("Create account")').click();

      // Verify error message is displayed
      await expect(page.locator('p[style*="crimson"]')).toBeVisible();
    });

    test('should display error for missing fields', async ({ page }) => {
      // Submit form without filling any fields
      await page.goto('/register');
      await page.locator('button:has-text("Create account")').click();

      // Verify error message is displayed
      await expect(page.locator('p[style*="crimson"]')).toBeVisible();
    });
  });

  test.describe('User Login', () => {
    test('should successfully login with valid credentials', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user via API
      await registerUser(context, name, email, password);

      // Clear session to simulate fresh login
      await clearSession(context);

      // Navigate to login page
      await page.goto('/login');

      // Fill in login form
      await page.locator('input[placeholder="Email"]').fill(email);
      await page.locator('input[placeholder="Password"]').fill(password);

      // Submit form
      await page.locator('button:has-text("Login")').click();

      // Wait for redirect to home page
      await page.waitForURL('**/');

      // Verify user is logged in
      await expect(page.locator('header')).toContainText(name);
    });

    test('should display error for invalid email', async ({ page }) => {
      const email = 'nonexistent@example.com';
      const password = 'TestPassword123';

      // Fill in login form
      await page.locator('input[placeholder="Email"]').fill(email);
      await page.locator('input[placeholder="Password"]').fill(password);

      // Submit form
      await page.locator('button:has-text("Login")').click();

      // Verify error message is displayed
      await expect(page.locator('p[style*="crimson"]')).toBeVisible();
      await expect(page.locator('p[style*="crimson"]')).toContainText('Invalid email or password');
    });

    test('should display error for incorrect password', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user via API
      await registerUser(context, name, email, password);

      // Clear session
      await clearSession(context);

      // Navigate to login page
      await page.goto('/login');

      // Fill in login form with wrong password
      await page.locator('input[placeholder="Email"]').fill(email);
      await page.locator('input[placeholder="Password"]').fill('WrongPassword123');

      // Submit form
      await page.locator('button:has-text("Login")').click();

      // Verify error message is displayed
      await expect(page.locator('p[style*="crimson"]')).toBeVisible();
    });

    test('should display error for missing fields', async ({ page }) => {
      // Submit form without filling any fields
      await page.locator('button:has-text("Login")').click();

      // Verify error message is displayed
      await expect(page.locator('p[style*="crimson"]')).toBeVisible();
    });
  });

  test.describe('User Logout', () => {
    test('should successfully logout and clear user data', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register and login user via API
      await registerUser(context, name, email, password);

      // Navigate to home page
      await page.goto('/');

      // Verify user is logged in
      await expect(page.locator('header')).toContainText(name);

      // Click logout button
      await page.locator('button:has-text("Logout")').click();

      // Verify user is logged out
      await expect(page.locator('header')).toContainText('Login');
      await expect(page.locator('header')).toContainText('Register');
      await expect(page.locator('header')).not.toContainText(name);
    });

    test('should redirect to home page after logout', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register and login user via API
      await registerUser(context, name, email, password);

      // Navigate to home page
      await page.goto('/');

      // Click logout button
      await page.locator('button:has-text("Logout")').click();

      // Verify redirect to home page
      await page.waitForURL('**/');
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain login session after page reload', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register and login user via API
      await registerUser(context, name, email, password);

      // Navigate to home page
      await page.goto('/');

      // Verify user is logged in
      await expect(page.locator('header')).toContainText(name);

      // Reload page
      await page.reload();

      // Verify user is still logged in
      await expect(page.locator('header')).toContainText(name);
    });

    test('should restore user data after page reload', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register and login user via API
      await registerUser(context, name, email, password);

      // Navigate to home page
      await page.goto('/');

      // Verify user name is displayed
      const userName = await page.locator('header span').first().textContent();
      expect(userName).toContain(name);

      // Reload page
      await page.reload();

      // Verify user name is still displayed
      const userNameAfterReload = await page.locator('header span').first().textContent();
      expect(userNameAfterReload).toContain(name);
    });
  });
});
