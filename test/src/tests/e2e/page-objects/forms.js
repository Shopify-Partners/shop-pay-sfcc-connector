import { expect } from '@playwright/test'
import path from 'path'
import { BasePage } from './base'
import { AccountPage } from './account'
import * as dotenv from 'dotenv'
dotenv.config({ path: path.join('..', '.env') })

exports.Forms = class Forms extends BasePage {
    constructor(page, isMobile) {
        super(page, isMobile)

        this.accountPage = new AccountPage(page, isMobile)
        this.registerTab = this.accountPage.registerTab

        this.loginFormEmail = '//input[@id="login-form-email"]'
    }

    async enterLoginEmail(data) {
        await this.page.locator(this.loginFormEmail).fill(data.email)
    }
}