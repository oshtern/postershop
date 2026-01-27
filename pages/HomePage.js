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


        // await this.pageBackwardArrow.click()
        // await expect(this.pageBackwardArrow).toHaveAttribute('disabled')
    }

    async openPoster(title) {
        await this.searchPoster(title)
        await this.viewButton.click()
        console.log(`Poster ${title} is opened`)
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
  
}

module.exports = HomePage