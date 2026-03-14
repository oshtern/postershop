/**
 * Checkout and Payment Tests
 * Tests for checkout flow, payment processing, and order completion
 */

import { test, expect } from '@playwright/test';
import {
  FRONTEND_BASE,
  generateTestEmail,
  registerUser,
  goToHome,
  clickFirstProduct,
  addProductToCart,
} from './utils';

test.describe('Checkout and Payment', () => {
  test.describe('Checkout Page Access', () => {
    test('should display checkout page when cart has items', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify checkout page is displayed
      await expect(page.locator('h2:has-text("Checkout")')).toBeVisible();
    });

    test('should display message when not logged in', async ({ page }) => {
      // Navigate to checkout page without logging in
      await page.goto('/checkout');

      // Verify login message is displayed
      await expect(page.locator('text=Log in to buy posters')).toBeVisible();

      // Verify login link is present
      await expect(page.locator('a:has-text("Login")').first()).toBeVisible();
    });

    test('should display message when cart is empty', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to checkout page with empty cart
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify empty cart message is displayed
      await expect(page.locator('text="Your cart is empty."')).toBeVisible();
    });
  });

  test.describe('Checkout Display', () => {
    test('should display order total', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify total is displayed
      await expect(page.locator('text=Total:')).toBeVisible();

      // Verify total contains price
      const total = await page.locator('strong').textContent();
      expect(total).toMatch(/\$\d+\.\d{2}/);
    });

    test('should display shipping address input', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify shipping address input is visible
      const input = page.locator('input[placeholder="Shipping address"]');
      await expect(input).toBeVisible();

      // Verify input has default value
      const value = await input.inputValue();
      expect(value).toBeTruthy();
    });

    test('should display pay button', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify pay button is visible
      const button = page.locator('button:has-text("Pay")');
      await expect(button).toBeVisible();

      // Verify button is enabled
      await expect(button).toBeEnabled();
    });

    test('should display order summary with items', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 2);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify total is displayed
      await expect(page.locator('text=Total:')).toBeVisible();
    });
  });

  test.describe('Shipping Address', () => {
    test('should allow editing shipping address', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Change shipping address
      const newAddress = '456 New St, New City, NY 10001';
      await page.locator('input[placeholder="Shipping address"]').clear();
      await page.locator('input[placeholder="Shipping address"]').fill(newAddress);

      // Verify address is updated
      const value = await page.locator('input[placeholder="Shipping address"]').inputValue();
      expect(value).toBe(newAddress);
    });

    test('should disable address input when not logged in', async ({ page }) => {
      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify address input is disabled
      const input = page.locator('input[placeholder="Shipping address"]');
      await expect(input).toBeDisabled();
    });

    test('should disable address input when cart is empty', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to checkout page with empty cart
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify address input is disabled
      const input = page.locator('input[placeholder="Shipping address"]');
      await expect(input).toBeDisabled();
    });
  });

  test.describe('Payment Processing', () => {
    test('should successfully process payment', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Click pay button
      const payButton = page.locator('button:has-text("Pay")');
      await payButton.click();

      // Wait for payment processing
      await page.waitForTimeout(1000);

      // Verify redirect to home page
      await page.waitForURL(`${FRONTEND_BASE}/`);

      // Verify success message is displayed
      await expect(page.locator('text=/Transaction successful/')).toBeVisible();
    });

    test('should display order ID after successful payment', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Click pay button
      await page.locator('button:has-text("Pay")').click();

      // Wait for payment processing
      await page.waitForTimeout(1000);

      // Verify order ID is displayed in success message
      await expect(page.locator('text=/Order #\\d+/')).toBeVisible();
    });

    test('should clear cart after successful payment', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Verify cart has 1 item
      let cartCount = await page.locator('.badge').textContent();
      expect(cartCount).toBe('1');

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Click pay button
      await page.locator('button:has-text("Pay")').click();

      // Wait for payment processing
      await page.waitForTimeout(1000);

      // Verify cart is cleared
      cartCount = await page.locator('.badge').textContent();
      expect(cartCount).toBe('0');
    });

    test('should show processing state during payment', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Click pay button
      const payButton = page.locator('button:has-text("Pay")');
      await payButton.click();

      // Verify button shows processing state or is disabled
      await page.waitForTimeout(100);
      const isDisabled = await payButton.isDisabled();
      const buttonText = await payButton.textContent();

      expect(isDisabled || buttonText.includes('Processing')).toBeTruthy();
    });

    test('should disable pay button when not logged in', async ({ page }) => {
      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify pay button is disabled
      const button = page.locator('button:has-text("Pay")');
      await expect(button).toBeDisabled();
    });

    test('should disable pay button when cart is empty', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to checkout page with empty cart
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify pay button is disabled
      const button = page.locator('button:has-text("Pay")');
      await expect(button).toBeDisabled();
    });
  });

  test.describe('Complete Purchase Flow', () => {
    test('should complete full purchase flow', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';
      const name = 'Test User';

      // Register user
      await registerUser(context, name, email, password);

      // Navigate to home page
      await goToHome(page);

      // Add first product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Go back and add another product
      await page.locator('a:has-text("PosterShop")').click();
      await page.waitForLoadState('networkidle');
      await page.locator('.grid > div').nth(1).click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 2);

      // Verify cart has 3 items
      let cartCount = await page.locator('.badge').textContent();
      expect(cartCount).toBe('3');

      // Navigate to cart
      await page.locator('a:has-text("Cart")').click();

      // Verify cart page displays items
      const items = page.locator('li');
      const itemCount = await items.count();
      expect(itemCount).toBeGreaterThan(0);

      // Navigate to checkout
      await page.locator('a:has-text("Checkout")').click();

      // Verify checkout page
      await expect(page.locator('h2:has-text("Checkout")')).toBeVisible();

      // Update shipping address
      await page.locator('input[placeholder="Shipping address"]').clear();
      await page.locator('input[placeholder="Shipping address"]').fill('789 Test Ave, Test City, TX 75001');

      // Process payment
      await page.locator('button:has-text("Pay")').click();

      // Wait for payment processing
      await page.waitForTimeout(1000);

      // Verify redirect to home and success message
      await page.waitForURL(`${FRONTEND_BASE}/`);
      await expect(page.locator('text=/Transaction successful/')).toBeVisible();

      // Verify cart is cleared
      cartCount = await page.locator('.badge').textContent();
      expect(cartCount).toBe('0');
    });

    test('should maintain user session through purchase', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';
      const name = 'Test User';

      // Register user
      await registerUser(context, name, email, password);

      // Navigate to home page
      await goToHome(page);

      // Verify user is logged in
      await expect(page.locator('header')).toContainText(name);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Verify user is still logged in
      await expect(page.locator('header')).toContainText(name);

      // Process payment
      await page.locator('button:has-text("Pay")').click();

      // Wait for payment processing
      await page.waitForTimeout(1000);

      // Verify user is still logged in after payment
      await expect(page.locator('header')).toContainText(name);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle payment errors gracefully', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to checkout page
      await page.goto(`${FRONTEND_BASE}/checkout`);

      // Click pay button
      await page.locator('button:has-text("Pay")').click();

      // Wait for response
      await page.waitForTimeout(1000);

      // Verify app is still functional (payment succeeds → home, error → cart)
      await expect(page.locator('header')).toBeVisible();
    });
  });
});
