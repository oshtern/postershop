const { expect } = require('@playwright/test')

class LoginPage {
    constructor(page) {
        this.page = page
        this.emailInput = page.locator('input[placeholder="Email"]')
        this.passwordInput = page.locator('input[type="password"]')
        this.submitButton = page.locator('//button[normalize-space(.) = "Login"]')
        this.logoutButton = page.locator('//button[normalize-space(.) = "Logout"]')
    }

    async navigate() {
        await this.page.goto('/login')
        console.log('Navigating to the page')
    }

    async login() {
        await this.emailInput.fill(process.env.USER_EMAIL)
        console.log('Entering email')
        await this.passwordInput.fill(process.env.USER_PASSWORD)
        console.log('Entering password')
        await this.submitButton.click()
        console.log('Submitting credentials')
    }

    async verifyLoginSuccess() {
        // Checking whether we are on the required page
        await expect(this.page).toHaveURL('/', { timeout: 15000 })
        await expect(this.logoutButton).toBeVisible()
        console.log('Authorization confirmed')
    }

    async logout() {
        await this.logoutButton.click()
        console.log('The user disconnected')
    }
}

module.exports = LoginPage
