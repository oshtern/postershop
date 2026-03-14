/**
 * Shopping Cart Tests
 * Tests for adding/removing items, cart display, and cart persistence
 */

import { test, expect } from '@playwright/test';
import {
  FRONTEND_BASE,
  generateTestEmail,
  registerUser,
  goToHome,
  waitForProductsToLoad,
  clickFirstProduct,
  addProductToCart,
  getCartItemCount,
} from './utils';

test.describe('Shopping Cart', () => {
  test.describe('Cart Access and Display', () => {
    test('should display cart link in header', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify cart link is visible
      const cartLink = page.locator('a:has-text("Cart")');
      await expect(cartLink).toBeVisible();
    });

    test('should display cart badge with item count', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Verify cart badge is visible
      const badge = page.locator('.badge');
      await expect(badge).toBeVisible();

      // Verify badge contains a number
      const count = await badge.textContent();
      expect(count).toMatch(/\d+/);
    });

    test('should navigate to cart page', async ({ page }) => {
      // Navigate to home page
      await goToHome(page);

      // Click cart link
      await page.locator('a:has-text("Cart")').click();

      // Verify we're on cart page
      await page.waitForURL(`${FRONTEND_BASE}/cart`);

      // Verify cart heading is displayed
      await expect(page.locator('h2:has-text("Your Cart")')).toBeVisible();
    });

    test('should display empty cart message', async ({ page }) => {
      // Navigate to cart page
      await page.goto(`${FRONTEND_BASE}/cart`);

      // Verify empty message is displayed
      await expect(page.locator('text="Empty."')).toBeVisible();
    });
  });

  test.describe('Adding Items to Cart', () => {
    test('should add product to cart from product details page', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Click first product
      await clickFirstProduct(page);

      // Add product to cart
      await addProductToCart(page, 1);

      // Verify cart badge is updated
      const count = await getCartItemCount(page);
      expect(count).toBe(1);
    });

    test('should add multiple quantities of same product', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Click first product
      await clickFirstProduct(page);

      // Add 3 items to cart
      await addProductToCart(page, 3);

      // Verify cart badge shows 3
      const count = await getCartItemCount(page);
      expect(count).toBe(3);
    });

    test('should add different products to cart', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add first product
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Go back to home
      await page.locator('a:has-text("PosterShop")').click();
      await waitForProductsToLoad(page);

      // Add second product
      await page.locator('.grid > div').nth(1).click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);

      // Verify cart badge shows 2
      const count = await getCartItemCount(page);
      expect(count).toBe(2);
    });

    test('should show message when not logged in', async ({ page }) => {
      // Navigate to home page without logging in
      await goToHome(page);

      // Click first product
      await clickFirstProduct(page);

      // Verify add to cart button is visible but disabled (login required to add items)
      const button = page.locator('button:has-text("Add to cart")');
      await expect(button).toBeVisible();
      await expect(button).toBeDisabled();
      await expect(page.locator('text=Log in to add items')).toBeVisible();
    });

    test('should update cart badge in real-time', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Verify initial cart count is 0
      let count = await getCartItemCount(page);
      expect(count).toBe(0);

      // Click first product
      await clickFirstProduct(page);

      // Add product to cart
      await addProductToCart(page, 1);

      // Verify cart count is updated
      count = await getCartItemCount(page);
      expect(count).toBe(1);
    });
  });

  test.describe('Cart Page Display', () => {
    test('should display cart items with details', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 2);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Verify cart items are displayed
      const items = page.locator('li');
      const count = await items.count();
      expect(count).toBeGreaterThan(0);

      // Verify item contains product image
      await expect(items.first().locator('img')).toBeVisible();

      // Verify item contains product title
      const itemText = await items.first().textContent();
      expect(itemText).toBeTruthy();

      // Verify item contains quantity
      expect(itemText).toContain('×');

      // Verify item contains price
      expect(itemText).toMatch(/\$\d+\.\d{2}/);
    });

    test('should display subtotal', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Verify subtotal is displayed
      await expect(page.locator('text=Subtotal:')).toBeVisible();

      // Verify subtotal contains price
      const subtotal = await page.locator('strong').textContent();
      expect(subtotal).toMatch(/\$\d+\.\d{2}/);
    });

    test('should display action buttons', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Verify Clear button is visible
      await expect(page.locator('button:has-text("Clear")')).toBeVisible();

      // Verify Checkout button is visible
      await expect(page.locator('a:has-text("Checkout")')).toBeVisible();
    });
  });

  test.describe('Removing Items from Cart', () => {
    test('should remove item from cart', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Verify item is in cart
      let items = page.locator('li');
      let count = await items.count();
      expect(count).toBe(1);

      // Remove item
      await page.locator('button:has-text("Remove")').click();

      // Verify item is removed
      items = page.locator('li');
      count = await items.count();
      expect(count).toBe(0);

      // Verify empty message is displayed
      await expect(page.locator('text="Empty."')).toBeVisible();
    });

    test('should update cart badge when removing items', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Verify cart badge shows 1
      let count = await getCartItemCount(page);
      expect(count).toBe(1);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Remove item
      await page.locator('button:has-text("Remove")').click();

      // Verify cart badge shows 0
      count = await getCartItemCount(page);
      expect(count).toBe(0);
    });

    test('should disable remove button when not logged in', async ({ page }) => {
      // Navigate to cart page
      await page.goto(`${FRONTEND_BASE}/cart`);

      // Verify remove button is disabled (if displayed)
      const removeButtons = page.locator('button:has-text("Remove")');
      const count = await removeButtons.count();

      if (count > 0) {
        await expect(removeButtons.first()).toBeDisabled();
      }
    });
  });

  test.describe('Clearing Cart', () => {
    test('should clear all items from cart', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add multiple products to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Go back and add another product
      await page.locator('a:has-text("PosterShop")').click();
      await waitForProductsToLoad(page);
      await page.locator('.grid > div').nth(1).click();
      await page.waitForLoadState('networkidle');
      await addProductToCart(page, 1);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Verify items are in cart
      let items = page.locator('li');
      let count = await items.count();
      expect(count).toBeGreaterThan(0);

      // Clear cart
      await page.locator('button:has-text("Clear")').click();

      // Verify cart is empty
      items = page.locator('li');
      count = await items.count();
      expect(count).toBe(0);

      // Verify empty message is displayed
      await expect(page.locator('text="Empty."')).toBeVisible();
    });

    test('should update cart badge after clearing', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Clear cart
      await page.locator('button:has-text("Clear")').click();

      // Verify cart badge shows 0
      const cartCount = await getCartItemCount(page);
      expect(cartCount).toBe(0);
    });

    test('should disable clear button when cart is empty', async ({ page }) => {
      // Navigate to cart page
      await page.goto(`${FRONTEND_BASE}/cart`);

      // Verify clear button is disabled
      const clearButton = page.locator('button:has-text("Clear")');
      await expect(clearButton).toBeDisabled();
    });
  });

  test.describe('Cart Persistence', () => {
    test('should persist cart after page reload', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Verify cart count
      let count = await getCartItemCount(page);
      expect(count).toBe(1);

      // Reload page
      await page.reload();

      // Verify cart count is still 1
      count = await getCartItemCount(page);
      expect(count).toBe(1);
    });

    test('should restore cart items after page reload', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 2);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Get initial item count
      let items = page.locator('li');
      let count = await items.count();
      expect(count).toBe(1);

      // Reload page
      await page.reload();

      // Verify items are restored
      items = page.locator('li');
      count = await items.count();
      expect(count).toBe(1);
    });
  });

  test.describe('Checkout Button', () => {
    test('should enable checkout button when cart has items', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Verify checkout button is enabled
      const checkoutButton = page.locator('a:has-text("Checkout")');
      await expect(checkoutButton).not.toHaveClass(/disabled/);
    });

    test('should disable checkout button when cart is empty', async ({ page }) => {
      // Navigate to cart page
      await page.goto(`${FRONTEND_BASE}/cart`);

      // Verify checkout button is disabled
      const checkoutButton = page.locator('a:has-text("Checkout")');
      await expect(checkoutButton).toHaveClass(/disabled/);
    });

    test('should navigate to checkout page', async ({ page, context }) => {
      const email = generateTestEmail();
      const password = 'TestPassword123';

      // Register user
      await registerUser(context, 'Test User', email, password);

      // Navigate to home page
      await goToHome(page);

      // Add product to cart
      await clickFirstProduct(page);
      await addProductToCart(page, 1);

      // Navigate to cart page
      await page.locator('a:has-text("Cart")').click();

      // Click checkout button
      await page.locator('a:has-text("Checkout")').click();

      // Verify we're on checkout page
      await page.waitForURL(`${FRONTEND_BASE}/checkout`);
      await expect(page.locator('h2:has-text("Checkout")')).toBeVisible();
    });
  });
});
