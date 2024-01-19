import { expect } from '@playwright/test'
import path from 'path'
import { BasePage } from './base.js'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join('..', '.env') })

const { BASE_URL } = process.env

exports.AccountPage = class AccountPage extends BasePage {
    constructor(page, isMobile) {
        super(page, isMobile)

        // Account registration form elements
        this.registerTab = page.locator('#register-tab')
        this.firstName = '//input[@id="registration-form-fname"]'
        this.lastName = '//input[@id="registration-form-lname"]'
        this.phone = '//input[@id="registration-form-phone"]'
        this.emailRegister = '//input[@id="registration-form-email"]'
        this.emailRegisterConf = '//input[@id="registration-form-email-confirm"]'
        this.password = '//input[@id="registration-form-password"]'
        this.passwordConf = '//input[@id="registration-form-password-confirm"]'
        this.createAccountBtn = page.locator('#register > form > button')

        // Account selectors
        this.emailLogin = '//input[@id="login-form-email"]'
        this.passwordLogin = '//input[@id="login-form-password"]'
        this.loginBtn = page.locator('#login > form.login > button')
    }

    async gotoAccountLogin() {
        const loginURL = `${BASE_URL}/en_US/Login-Show`
        await this.page.goto(`${loginURL}`)
    }

    async fillRegistrationForm(data) {
        await this.registerTab.click()
        await this.page.locator(this.firstName).fill(data.firstName)
        await this.page.locator(this.lastName).fill(data.lastName)
        await this.page.locator(this.phone).fill(data.phone)
        await this.page.locator(this.emailRegister).fill(data.email)
        await this.page.locator(this.emailRegisterConf).fill(data.email)
        await this.page.locator(this.password).fill(data.password)
        await this.page.locator(this.passwordConf).fill(data.password)
        await this.createAccountBtn.click()
    }

    async fillLoginForm(email, password) {
        await this.page.locator(this.emailLogin).fill(email)
        await this.page.locator(this.passwordLogin).fill(password)
        await this.loginBtn.click()
    }
}
