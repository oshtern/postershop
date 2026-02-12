const { test, expect } = require('@playwright/test')
const LoginPage = require('../pages/LoginPage')
const HomePage = require('../pages/HomePage')

const title = 'golden dunes'
const nextTitle = 'Canal Bridge'
const posterToBuy = 'Midnight Ocean'
const anotherPosterToBuy = 'Glasshouse Palms'
const secondPageTitle = 'Retro Cassette'
const thirdPageTitle = 'Palm Shadows'
const fourthPageTitle = 'Sakura Alley'


test.describe('Test Project test scenario', () => {
    let loginPage
    let homePage

    test.beforeEach(async ({ page }) => {
        // Initializing Page Objects
        loginPage = new LoginPage(page)
        homePage = new HomePage(page)

        // Navigating to the postershop portal
        await loginPage.navigate()

        // Authorizing to postershop portal
        await loginPage.login()
        await loginPage.verifyLoginSuccess()
    })

    test.afterEach(async () => {
        // Logout from the account
        await loginPage.logout()
    })

    test('Search for a poster', async ({ page }) => {
        // Finding a poster by title (the poster we are searhing for is on the first page)
        await homePage.searchPoster(title)
    })

    test('Check pagination', async ({ page }) => {
        // Navigating through pages: going three pages forward and one page back

        // Navigating to the 2nd page
        await homePage.navigateForward()
        const cardSearched1 = page.locator(`//h3[contains(normalize-space(.), "${secondPageTitle}")]`)
        await expect(cardSearched1).toBeVisible({ timeout: 10000 })

        // Navigating to the 3rd page
        await homePage.navigateForward()
        const cardSearched2 = page.locator(`//h3[contains(normalize-space(.), "${thirdPageTitle}")]`)
        await expect(cardSearched2).toBeVisible({ timeout: 10000 })

        // Navigating to the 4th page
        await homePage.navigateForward()
        const cardSearched3 = page.locator(`//h3[contains(normalize-space(.), "${fourthPageTitle}")]`)
        await expect(cardSearched3).toBeVisible({ timeout: 10000 })

        // Navigating to the 3rd page
        await homePage.navigateBackward()
        await expect(cardSearched2).toBeVisible({ timeout: 10000 })
    })

    test('Search for a poster minding pagination', async ({ page }) => {
        // Finding a poster by title (the poster we are searhing for is NOT on the first page) - BUG FOUND!

        // Navigating to the 6th page
        await homePage.navigateForward()
        await homePage.navigateForward()
        await homePage.navigateForward()
        await homePage.navigateForward()
        await homePage.navigateForward()
        await homePage.searchPoster(nextTitle)
    })

    test('View a poster', async ({ page }) => {
        // Opening a poster to view details
        // await homePage.searchPoster(nextTitle)
        await homePage.openPoster(nextTitle)
    })

    test('Sorting posters by the lowest price', async ({ page }) => {
        // Sorting posters to show the cheapest first
        await homePage.filterPosters('price_asc')

        await page.waitForLoadState('networkidle')

        const actualPrices = await homePage.getPosterPrices()

        if (actualPrices.length > 1) {
            for (let i = 0; i < actualPrices.length - 1; i++) {
                const currentPrice = actualPrices[i]
                const nextPrice = actualPrices[i + 1]
                console.log(`Comparing: Item #${i} ($${currentPrice}) >= Item #${i + 1} ($${nextPrice})`)
                expect(currentPrice).toBeLessThanOrEqual(nextPrice)
            }
        }
        expect(true).toBe(true)
    })

    test('Sorting posters by the highest price', async ({ page }) => {
        // Sorting posters to show the most expensive first
        await homePage.filterPosters('price_desc')

        await page.waitForLoadState('networkidle')

        const actualPrices = await homePage.getPosterPrices()

        if (actualPrices.length > 1) {
            for (let i = 0; i < actualPrices.length - 1; i++) {
                const currentPrice = actualPrices[i]
                const nextPrice = actualPrices[i + 1]
                console.log(`Comparing: Item #${i} ($${currentPrice}) >= Item #${i + 1} ($${nextPrice})`)
                expect(currentPrice).toBeGreaterThanOrEqual(nextPrice)
        }
    }
        expect(true).toBe(true)
    })

    test('Sorting posters by the date when they were added', async ({ page }) => {
        // Sorting posters to show the newest first
        await homePage.filterPosters('new')

        await page.waitForLoadState('networkidle')

        const allPosters = page.locator('.grid .card')
        const firstPoster = allPosters.first()
        await expect(firstPoster.locator('h3')).toContainText('Golden Dunes')
    })

     test('Buying 1 poster', async ({ page }) => {
        // Clicking "Add to cart" button for particular poster
        await homePage.openPoster(posterToBuy)
        await homePage.addPosterToCart(1)

        // Checkout
        await homePage.buyPoster()
    })

    test('Adding multiple copies of a poster to cart and remove them', async ({ page }) => {
        // Buying more than one copy of one poster
        await homePage.openPoster(posterToBuy)
        await homePage.addPosterToCart(3)
    })
    
    test('Buying multiple posters', async ({ page }) => {
        // Adding several different posters to cart
        await homePage.openPoster(posterToBuy)
        await homePage.addPosterToCart(1)

        await homePage.openPoster(anotherPosterToBuy)
        await homePage.addPosterToCart(1)

        await homePage.buyPoster()
    })


})