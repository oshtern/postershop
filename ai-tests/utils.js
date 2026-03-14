/**
 * Test utilities and helper functions for PosterShop e2e tests
 */

// Base URL for the app under test. This can be overridden via env (e.g. BASE_URL=http://localhost:4000)
const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const API_BASE = process.env.API_BASE || BASE_URL;
const FRONTEND_BASE = process.env.FRONTEND_BASE || BASE_URL;

/**
 * Generate a unique email for test users
 * @returns {string} Unique email address
 */
function generateTestEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Register a new test user via API
 * @param {object} context - Playwright test context
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User object
 */
async function registerUser(context, name, email, password) {
  const response = await context.request.post(`${API_BASE}/auth/register`, {
    data: {
      name,
      email,
      password,
    },
  });

  if (!response.ok()) {
    const error = await response.json();
    throw new Error(`Registration failed: ${error.error || 'Unknown error'}`);
  }

  return response.json();
}

/**
 * Login a user via API and set session cookie
 * @param {object} context - Playwright test context
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User object
 */
async function loginUser(context, email, password) {
  const response = await context.request.post(`${API_BASE}/auth/login`, {
    data: {
      email,
      password,
    },
  });

  if (!response.ok()) {
    const error = await response.json();
    throw new Error(`Login failed: ${error.error || 'Unknown error'}`);
  }

  return response.json();
}

/**
 * Wait for a product to be visible on the page
 * @param {object} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds
 */
async function waitForProductsToLoad(page, timeout = 5000) {
  await page.waitForSelector('.grid', { timeout, state: 'visible' });
}

/**
 * Get the cart item count from the header badge
 * @param {object} page - Playwright page object
 * @returns {Promise<number>} Number of items in cart
 */
async function getCartItemCount(page) {
  const badge = await page.locator('.badge').textContent();
  return parseInt(badge || '0', 10);
}

/**
 * Add a product to cart from the product details page
 * @param {object} page - Playwright page object
 * @param {number} quantity - Quantity to add
 */
async function addProductToCart(page, quantity = 1) {
  // Set quantity if not 1
  if (quantity !== 1) {
    await page.locator('input[type="number"]').fill(String(quantity));
  }

  // Click "Add to cart" button
  await page.locator('button:has-text("Add to cart")').click();

  // Wait for cart to update
  await page.waitForTimeout(500);
}

/**
 * Navigate to home page and wait for products to load
 * @param {object} page - Playwright page object
 */
async function goToHome(page) {
  // Use relative URLs; base URL is configured via playwright.config.js
  await page.goto('/');
  await waitForProductsToLoad(page);
}

/**
 * Search for products on the home page
 * @param {object} page - Playwright page object
 * @param {string} query - Search query
 */
async function searchProducts(page, query) {
  await page.locator('input[placeholder="Search posters..."]').fill(query);
  await page.waitForTimeout(500); // Wait for search to trigger
  // await waitForProductsToLoad(page); // Removed to avoid timeout on no results
}

/**
 * Sort products by a specific option
 * @param {object} page - Playwright page object
 * @param {string} sortValue - Sort value (new, price_asc, price_desc)
 */
async function sortProducts(page, sortValue) {
  await page.locator('select').selectOption(sortValue);
  await page.waitForTimeout(500);
  await waitForProductsToLoad(page);
}

/**
 * Get all product titles currently displayed
 * @param {object} page - Playwright page object
 * @returns {Promise<string[]>} Array of product titles
 */
async function getProductTitles(page) {
  const titles = await page.locator('.grid > div').allTextContents();
  return titles;
}

/**
 * Click on the first product in the grid
 * @param {object} page - Playwright page object
 */
async function clickFirstProduct(page) {
  await page.locator('.grid > div').first().locator('a:has-text("View")').click();
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to a specific page using pagination
 * @param {object} page - Playwright page object
 * @param {number} pageNumber - Page number (1-indexed)
 */
async function goToPage(page, pageNumber) {
  if (pageNumber === 1) {
    // Already on first page
    return;
  }

  for (let i = 1; i < pageNumber; i++) {
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(500);
    await waitForProductsToLoad(page);
  }
}

/**
 * Clear all cookies to simulate a fresh session
 * @param {object} context - Playwright test context
 */
async function clearSession(context) {
  await context.clearCookies();
}

module.exports = {
  BASE_URL,
  API_BASE,
  FRONTEND_BASE,
  generateTestEmail,
  registerUser,
  loginUser,
  waitForProductsToLoad,
  getCartItemCount,
  addProductToCart,
  goToHome,
  searchProducts,
  sortProducts,
  getProductTitles,
  clickFirstProduct,
  goToPage,
  clearSession,
};
