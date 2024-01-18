import { expect } from '@playwright/test'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join('..', '.env') })

const { BASE_URL } = process.env

exports.BasePage = class BasePage {
    constructor(page, isMobile) {
        this.page = page
        this.isMobile = isMobile
        this.baseUrl = BASE_URL

        // Cookies accept locator
        this.acceptCookiesButton = page.locator('#consent-tracking > div > div > div.modal-footer > div > button.affirm.btn.btn-primary')
    }

    async goHome(url = this.baseUrl, options) {
        await this.page.goto(url, options)
        await this.page.waitForTimeout(3000)
    }

    async acceptCookies() {
        await this.acceptCookiesButton.click()
        return
    }

    async getLogs() {
        this.page.on('console', async msg => {
            const values = []
            for (const arg of msg.args())
                values.push(await arg.jsonValue())
                console.log(values)
        })
    }

    async authorizeAndAcceptCookies() {
        await this.goto()
        await this.authorize()
        await this.acceptCookies()
    }

    async scrollToTop() {
        await this.page.evaluate(() => window.scrollTo(0, 0))
        await this.page.waitForTimeout(2000)
    }

    async scrollToBottom() {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await this.page.waitForTimeout(2000)
    }

    async scrollToBottomSlowly() {
        await this.page.evaluate(async () => {
            await new Promise(resolve => {
                let scrollHeight
                let totalHeight
                const distance = 150

                const timer = setInterval(() => {
                    window.scrollBy(0, distance)
                    totalHeight = window.scrollY + window.innerHeight
                    scrollHeight = document.body.scrollHeight

                    if (totalHeight >= scrollHeight - 100) {
                        clearInterval(timer)
                        resolve()
                    }
                }, 80)
            })
        })
    }

    async generateEmail() {
        const email = `playwright-automation-${uuidv4().slice(1, 6)}@mailinator.com`
        return email
    }

    async urlParser() {
        const ogURL = new URL(this.page.url())
        const hostname = ogURL.hostname
        const path = ogURL.pathname
        const search = ogURL.search
        const hash = ogURL.hash
        return {
            url: ogURL,
            hostname: hostname,
            path: path,
            search: search,
            hash: hash
        }
    }
}
