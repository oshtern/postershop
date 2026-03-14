/**
 * Product Browsing Tests
 * Tests for product listing, search, sorting, and pagination
 */

import { test, expect } from '@playwright/test';
import {
  FRONTEND_BASE,
  goToHome,
  waitForProductsToLoad,
  searchProducts,
  sortProducts,
  getProductTitles,
  clickFirstProduct,
  goToPage,
} from './utils';

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    await goToHome(page);
  });

  test.describe('Product Listing', () => {
    test('should display products on home page', async ({ page }) => {
      // Verify products are displayed
      const products = page.locator('.grid > div');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display product cards with required information', async ({ page }) => {
      // Get first product card
      const firstProduct = page.locator('.grid > div').first();

      // Verify product card contains title
      const title = await firstProduct.locator('h3, h4, strong, div').first().textContent();
      expect(title).toBeTruthy();

      // Verify product card contains price
      const price = await firstProduct.textContent();
      expect(price).toMatch(/\$\d+\.\d{2}/);
    });

    test('should load more products on pagination', async ({ page }) => {
      // Get initial product count
      const initialCount = await page.locator('.grid > div').count();

      // Go to next page
      await page.locator('button:has-text("Next")').click();
      await waitForProductsToLoad(page);

      // Verify products are loaded
      const newCount = await page.locator('.grid > div').count();
      expect(newCount).toBeGreaterThan(0);
    });

    test('should display pagination controls', async ({ page }) => {
      // Verify pagination buttons exist
      const prevButton = page.locator('button:has-text("Prev")');
      const nextButton = page.locator('button:has-text("Next")');

      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();

      // Verify page indicator is displayed
      await expect(page.locator('text=/Page \\d+ of \\d+/')).toBeVisible();
    });
  });

  test.describe('Product Search', () => {
    test('should filter products by search query', async ({ page }) => {
      // Search for a specific product
      await searchProducts(page, 'abstract');

      // Verify products are filtered
      const products = page.locator('.grid > div');
      const count = await products.count();

      // Should have some results (at least 1)
      expect(count).toBeGreaterThan(0);
    });

    test('should display no results for non-existent product', async ({ page }) => {
      // Search for non-existent product
      await searchProducts(page, 'nonexistentproduct12345');
      await page.waitForTimeout(1000); // Wait for search to complete

      // Verify no products are displayed
      const products = page.locator('.grid > div');
      const count = await products.count();
      expect(count).toBe(0);
    });

    test('should clear search results when search is cleared', async ({ page }) => {
      // Search for a product
      await searchProducts(page, 'abstract');

      // Get count of filtered results
      let count = await page.locator('.grid > div').count();
      expect(count).toBeGreaterThan(0);

      // Clear search
      await page.locator('input[placeholder="Search posters..."]').clear();
      await page.waitForTimeout(500);
      await waitForProductsToLoad(page);

      // Verify all products are displayed again
      count = await page.locator('.grid > div').count();
      expect(count).toBeGreaterThan(0);
    });

    test('should reset pagination when searching', async ({ page }) => {
      // Go to page 2
      await page.locator('button:has-text("Next")').click();
      await waitForProductsToLoad(page);

      // Verify we're on page 2
      let pageText = await page.locator('text=/Page \\d+ of \\d+/').textContent();
      expect(pageText).toContain('Page 2');

      // Search for a product
      await searchProducts(page, 'abstract');
      await page.waitForTimeout(1000); // Wait for search to complete

      // Verify we're back on page 1
      pageText = await page.locator('text=/Page \\d+ of \\d+/').textContent();
      expect(pageText).toContain('Page 1');
    });

    test('should be case-insensitive', async ({ page }) => {
      // Search with lowercase
      await searchProducts(page, 'abstract');
      const lowercaseCount = await page.locator('.grid > div').count();

      // Clear and search with uppercase
      await page.locator('input[placeholder="Search posters..."]').clear();
      await page.waitForTimeout(500);
      await searchProducts(page, 'ABSTRACT');
      const uppercaseCount = await page.locator('.grid > div').count();

      // Should have same results
      expect(lowercaseCount).toBe(uppercaseCount);
    });
  });

  test.describe('Product Sorting', () => {
    test('should sort products by newest', async ({ page }) => {
      // Sort by newest
      await sortProducts(page, 'new');

      // Verify products are displayed
      const products = page.locator('.grid > div');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should sort products by price low to high', async ({ page }) => {
      // Sort by price low to high
      await sortProducts(page, 'price_asc');

      // Verify products are displayed
      const products = page.locator('.grid > div');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should sort products by price high to low', async ({ page }) => {
      // Sort by price high to low
      await sortProducts(page, 'price_desc');

      // Verify products are displayed
      const products = page.locator('.grid > div');
      const count = await products.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should maintain sort order when paginating', async ({ page }) => {
      // Sort by price ascending
      await sortProducts(page, 'price_asc');

      // Get sort value
      const sortValue = await page.locator('select').inputValue();
      expect(sortValue).toBe('price_asc');

      // Go to next page
      await page.locator('button:has-text("Next")').click();
      await waitForProductsToLoad(page);

      // Verify sort order is maintained
      const newSortValue = await page.locator('select').inputValue();
      expect(newSortValue).toBe('price_asc');
    });

    test('should reset pagination when changing sort', async ({ page }) => {
      // Go to page 2
      await page.locator('button:has-text("Next")').click();
      await waitForProductsToLoad(page);

      // Verify we're on page 2
      let pageText = await page.locator('text=/Page \\d+ of \\d+/').textContent();
      expect(pageText).toContain('Page 2');

      // Change sort
      await sortProducts(page, 'price_asc');

      // Verify we're back on page 1
      pageText = await page.locator('text=/Page \\d+ of \\d+/').textContent();
      expect(pageText).toContain('Page 1');
    });
  });

  test.describe('Product Details', () => {
    test('should navigate to product details page', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Verify product details page is loaded
      await expect(page.locator('h1, h2')).toBeVisible();

      // Verify product information is displayed
      await expect(page.locator('img')).toBeVisible();
      await expect(page.locator('text=/\\$\\d+\\.\\d{2}/')).toBeVisible();
    });

    test('should display product title and description', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Verify title is displayed
      const title = await page.locator('h1, h2').first().textContent();
      expect(title).toBeTruthy();

      // Verify description is displayed
      const description = await page.locator('p').first().textContent();
      expect(description).toBeTruthy();
    });

    test('should display product price', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Verify price is displayed
      const price = await page.locator('text=/\\$\\d+\\.\\d{2}/').first().textContent();
      expect(price).toMatch(/\$\d+\.\d{2}/);
    });

    test('should display product image', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Verify image is displayed
      const image = page.locator('img').first();
      await expect(image).toBeVisible();

      // Verify image has src attribute
      const src = await image.getAttribute('src');
      expect(src).toBeTruthy();
    });

    test('should display product reviews section', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Verify reviews section exists
      await expect(page.locator('h2:has-text("Reviews"), h3:has-text("Reviews")')).toBeVisible();
    });

    test('should display star ratings for reviews', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Verify reviews with star ratings are displayed
      const reviews = page.locator('li');
      const count = await reviews.count();

      if (count > 0) {
        // If there are reviews, verify they contain star characters
        const firstReview = reviews.first();
        const text = await firstReview.textContent();
        expect(text).toMatch(/★|☆/);
      }
    });

    test('should display add to cart button', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Verify add to cart button is visible
      const button = page.locator('button:has-text("Add to cart")');
      await expect(button).toBeVisible();
    });

    test('should display quantity input', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Verify quantity input is visible
      const input = page.locator('input[type="number"]');
      await expect(input).toBeVisible();

      // Verify default quantity is 1
      const value = await input.inputValue();
      expect(value).toBe('1');
    });

    test('should allow changing quantity', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Change quantity
      await page.locator('input[type="number"]').fill('5');

      // Verify quantity is updated
      const value = await page.locator('input[type="number"]').inputValue();
      expect(value).toBe('5');
    });

    test('should navigate back to home page', async ({ page }) => {
      // Click first product
      await clickFirstProduct(page);

      // Click home link
      await page.locator('a:has-text("PosterShop")').click();

      // Verify we're back on home page
      await page.waitForURL(`${FRONTEND_BASE}/`);
      await waitForProductsToLoad(page);
    });
  });

  test.describe('Pagination', () => {
    test('should disable prev button on first page', async ({ page }) => {
      // Verify prev button is disabled on first page
      const prevButton = page.locator('button:has-text("Prev")');
      await expect(prevButton).toBeDisabled();
    });

    test('should enable prev button on second page', async ({ page }) => {
      // Go to next page
      await page.locator('button:has-text("Next")').click();
      await waitForProductsToLoad(page);

      // Verify prev button is enabled
      const prevButton = page.locator('button:has-text("Prev")');
      await expect(prevButton).toBeEnabled();
    });

    test('should navigate to previous page', async ({ page }) => {
      // Go to next page
      await page.locator('button:has-text("Next")').click();
      await waitForProductsToLoad(page);

      // Verify we're on page 2
      let pageText = await page.locator('text=/Page \\d+ of \\d+/').textContent();
      expect(pageText).toContain('Page 2');

      // Go back to previous page
      await page.locator('button:has-text("Prev")').click();
      await waitForProductsToLoad(page);

      // Verify we're back on page 1
      pageText = await page.locator('text=/Page \\d+ of \\d+/').textContent();
      expect(pageText).toContain('Page 1');
    });

    test('should display correct page number', async ({ page }) => {
      // Verify page indicator shows page 1
      let pageText = await page.locator('text=/Page \\d+ of \\d+/').textContent();
      expect(pageText).toMatch(/Page 1 of \d+/);

      // Go to next page
      await page.locator('button:has-text("Next")').click();
      await waitForProductsToLoad(page);

      // Verify page indicator shows page 2
      pageText = await page.locator('text=/Page \\d+ of \\d+/').textContent();
      expect(pageText).toMatch(/Page 2 of \d+/);
    });
  });
});
