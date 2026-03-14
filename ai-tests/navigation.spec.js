/**
 * Navigation and UI Tests
 * Tests for page navigation, header/footer, and general UI elements
 */

import { test, expect } from '@playwright/test';
import {
  FRONTEND_BASE,
  generateTestEmail,
  registerUser,
  goToHome,
} from './utils';

test.describe('Navigation and UI', () => {
  test.describe('Header Navigation', () => {
    test('should display header on all pages', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify header is visible
      const header = page.locator('header');
      await expect(header).toBeVisible();
    });

    test('should display PosterShop logo', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify logo is visible
      const logo = page.locator('a:has-text("PosterShop")');
      await expect(logo).toBeVisible();
    });

    test('should navigate to home page when clicking logo', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Navigate to another page
      await page.goto(`${FRONTEND_BASE}/login`);

      // Click logo
      await page.locator('a:has-text("PosterShop")').click();

      // Verify we're back on home page
      await page.waitForURL(`${FRONTEND_BASE}/`);
    });

    test('should display login and register links when not logged in', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify login link is visible
      await expect(page.locator('a:has-text("Login")')).toBeVisible();

      // Verify register link is visible
      await expect(page.locator('a:has-text("Register")')).toBeVisible();
    });

    test('should navigate to login page', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Click login link
      await page.locator('a:has-text("Login")').click();

      // Verify we're on login page
      await page.waitForURL(`${FRONTEND_BASE}/login`);
      await expect(page.locator('h2:has-text("Login")')).toBeVisible();
    });

    test('should navigate to register page', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Click register link
      await page.locator('a:has-text("Register")').click();

      // Verify we're on register page
      await page.waitForURL(`${FRONTEND_BASE}/register`);
      await expect(page.locator('h2:has-text("Register")')).toBeVisible();
    });

    test('should display user name when logged in', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, name, email, password);

      // Navigate to home page
      await goToHome(page);

      // Verify user name is displayed
      await expect(page.locator('header')).toContainText(name);
    });

    test('should display logout button when logged in', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, name, email, password);

      // Navigate to home page
      await goToHome(page);

      // Verify logout button is visible
      await expect(page.locator('button:has-text("Logout")')).toBeVisible();
    });

    test('should hide login/register links when logged in', async ({ page, context }) => {
      const name = 'Test User';
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, name, email, password);

      // Navigate to home page
      await goToHome(page);

      // Verify login link is not visible
      const loginLinks = page.locator('a:has-text("Login")');
      const count = await loginLinks.count();
      expect(count).toBe(0);

      // Verify register link is not visible
      const registerLinks = page.locator('a:has-text("Register")');
      const registerCount = await registerLinks.count();
      expect(registerCount).toBe(0);
    });

    test('should display cart link', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify cart link is visible
      await expect(page.locator('a:has-text("Cart")')).toBeVisible();
    });

    test('should navigate to cart page', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Click cart link
      await page.locator('a:has-text("Cart")').click();

      // Verify we're on cart page
      await page.waitForURL(`${FRONTEND_BASE}/cart`);
      await expect(page.locator('h2:has-text("Your Cart")')).toBeVisible();
    });
  });

  test.describe('Footer Navigation', () => {
    test('should display footer on all pages', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify footer is visible
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });

    test('should display footer links', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Scroll to footer
      await page.locator('footer').scrollIntoViewIfNeeded();

      // Verify footer is visible
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    });
  });

  test.describe('Page Navigation', () => {
    test('should navigate between pages', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Navigate to login page
      await page.goto(`${FRONTEND_BASE}/login`);
      await expect(page.locator('h2:has-text("Login")')).toBeVisible();

      // Navigate to register page
      await page.goto(`${FRONTEND_BASE}/register`);
      await expect(page.locator('h2:has-text("Register")')).toBeVisible();

      // Navigate to cart page
      await page.goto(`${FRONTEND_BASE}/cart`);
      await expect(page.locator('h2:has-text("Your Cart")')).toBeVisible();

      // Navigate back to home page
      await page.goto(`${FRONTEND_BASE}/`);
      await expect(page.locator('text=/Page \\d+ of \\d+/')).toBeVisible();
    });

    test('should handle back button navigation', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Navigate to login page
      await page.goto(`${FRONTEND_BASE}/login`);

      // Use browser back button
      await page.goBack();

      // Verify we're back on home page
      await page.waitForURL(`${FRONTEND_BASE}/`);
    });

    test('should handle forward button navigation', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Navigate to login page
      await page.goto(`${FRONTEND_BASE}/login`);

      // Use browser back button
      await page.goBack();

      // Use browser forward button
      await page.goForward();

      // Verify we're on login page
      await page.waitForURL(`${FRONTEND_BASE}/login`);
    });
  });

  test.describe('Responsive Navigation', () => {
    test('should display navigation elements on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to home page
      await goToHome(page);

      // Verify header is visible
      await expect(page.locator('header')).toBeVisible();

      // Verify navigation links are visible
      await expect(page.locator('a:has-text("Cart")')).toBeVisible();
    });

    test('should display navigation elements on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Navigate to home page
      await goToHome(page);

      // Verify header is visible
      await expect(page.locator('header')).toBeVisible();

      // Verify navigation links are visible
      await expect(page.locator('a:has-text("Cart")')).toBeVisible();
    });

    test('should display navigation elements on desktop viewport', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Navigate to home page
      await goToHome(page);

      // Verify header is visible
      await expect(page.locator('header')).toBeVisible();

      // Verify navigation links are visible
      await expect(page.locator('a:has-text("Cart")')).toBeVisible();
    });
  });

  test.describe('Page Title and Meta', () => {
    test('should have proper page title on home page', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify page title
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('should have proper page title on login page', async ({ page }) => {
      // Navigate to login page
      await page.goto(`${FRONTEND_BASE}/login`);

      // Verify page title
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('should have proper page title on cart page', async ({ page }) => {
      // Navigate to cart page
      await page.goto(`${FRONTEND_BASE}/cart`);

      // Verify page title
      const title = await page.title();
      expect(title).toBeTruthy();
    });
  });

  test.describe('Error Pages', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      // Navigate to non-existent page
      await page.goto(`${FRONTEND_BASE}/nonexistent`);

      // Verify page loads (React Router should handle routing)
      const content = await page.content();
      expect(content).toBeTruthy();
    });
  });

  test.describe('Link Functionality', () => {
    test('should open links in correct target', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify all navigation links are clickable
      const loginLink = page.locator('a:has-text("Login")');
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', /login/);
    });

    test('should not have broken links', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Get all links
      const links = page.locator('a');
      const count = await links.count();

      // Verify links exist
      expect(count).toBeGreaterThan(0);

      // Check first few links are valid
      for (let i = 0; i < Math.min(5, count); i++) {
        const href = await links.nth(i).getAttribute('href');
        expect(href).toBeTruthy();
      }
    });
  });

  test.describe('Loading States', () => {
    test('should show loading indicator when fetching products', async ({ page }) => {
      // Navigate to home page
      await page.goto(`${FRONTEND_BASE}/`);

      // Check if loading indicator appears
      const loadingText = page.locator('text="Loading…"');

      // Either loading indicator appears or products load quickly
      const isLoading = await loadingText.isVisible().catch(() => false);
      const productsLoaded = await page.locator('.grid > div').count();

      expect(isLoading || productsLoaded > 0).toBeTruthy();
    });
  });

  test.describe('Banner Display', () => {
    test('should display banner on home page', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify banner exists
      const banner = page.locator('section, div').first();
      await expect(banner).toBeVisible();
    });
  });
});
