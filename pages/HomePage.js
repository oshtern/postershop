const { expect } = require('@playwright/test')
const config = require('../config')

class HomePage {
    constructor(page) {
        this.page = page
        this.searchInput = page.locator('input[placeholder="Search posters..."]')
        this.posterCard = page.locator('[class="card"]')
        this.pageForwardArrow = page.locator('//button[normalize-space(.) = "Next"]')
        this.pageBackwardArrow = page.locator('//button[normalize-space(.) = "Prev"]')
        this.viewButton = page.locator('//div[@class="actions"]/a[normalize-space(.) = "View"]')
        this.filterDropdown = page.locator('select[class="input"]')
        this.posterPageHeader = page.locator('div p')
        this.purchaseAmount = page.locator('input[type="number"]')
        this.addToCartButton = page.locator('//button[@class="btn primary" and normalize-space(.) = "Add to cart"]')
        this.cartIcon = page.locator('a[href="/cart"]')
        this.cartItemsNumberIcon = page.locator('a[href="/cart"] span')
        this.returnToShopButton = page.locator('//a[normalize-space(.) = "PosterShop"]')
        this.checkoutButton = page.locator('a[href="/checkout"]')
        this.payButton = page.locator('//button[@class="btn primary" and normalize-space(.) = "Pay"]')
        this.paymentSuccess = page.locator('//div[@role="status"]/div[normalize-space(.) = "Transaction successful. Order #640600."]')
        this.shopTable = page.locator('div.grid')
    
    }

    async searchPoster(title) {
        await this.searchInput.fill(title)
        await expect(this.posterCard).toBeVisible({ timeout: 10000 })
        const cardSearched = this.page.locator(`//h3[contains(normalize-space(.), "${title}")]`)
        await expect(cardSearched).toBeVisible({ timeout: 10000 })
    }

    async navigateForward() {
        await this.pageForwardArrow.click()
        console.log('Moved one page forward')
    }

    async navigateBackward() {
        await this.pageBackwardArrow.click()
        console.log('Moved one page backward')
    }

    async verifyPaginationNavigation() {
        await expect(this.pageBackwardArrow).not.toHaveAttribute('disabled')
        console.log('The page was turned: the "Previous" button is not disabled anymore')
    }

    async returnToFirstPage() {
        while (!(await this.pageBackwardArrow.isDisabled())) {
            await this.pageBackwardArrow.click()
            await this.page.waitForTimeout(100)
        }
        await expect(this.pageBackwardArrow).toBeDisabled()
    }

    async openPoster(title) {
        await this.searchPoster(title)
        await this.viewButton.click()
        console.log(`Opening poster ${title}`)
        await expect(this.posterPageHeader).toContainText('Premium matte poster')
    }

    async filterPosters(searchCriteria) {
        await this.filterDropdown.selectOption(searchCriteria)
        console.log(`The posters are sorted in ${searchCriteria} order`)
    }

    async getPosterPrices() {
        const priceElements = this.page.locator('div.price');

        const prices = await priceElements.evaluateAll(elements => {
            return elements.map(el => {
                const priceText = el.textContent || ''
                // Removing the '$' and any whitespace, then converting to a number
                return parseFloat(priceText.replace('$', '').trim())
            })
        })

        return prices
    }

    async addPosterToCart(number) {
        await this.purchaseAmount.fill(String(number))
        console.log('Editing the amount of the item')
        await this.addToCartButton.click()
        console.log('Adding the item to the cart')
        await expect(this.cartItemsNumberIcon).not.toContainText('0')
        console.log('Checking that the cart is not empty now')
        // Return to the main page
        await this.returnToShopButton.click()
        console.log('Returning to the list of posters')
    }

    async buyPoster() {
        await this.cartIcon.click()
        console.log('Opening the cart')
        await this.checkoutButton.click()
        console.log('Clicking Checkout btn')
        await this.payButton.click()
        console.log('Confirming payment')
        await expect(this.cartItemsNumberIcon).toContainText('0')
        console.log('Checking that the cart is empty now')
    }
    
  
}

module.exports = HomePage