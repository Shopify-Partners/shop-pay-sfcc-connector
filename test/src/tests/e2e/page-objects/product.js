import { expect } from '@playwright/test'
import path from 'path'
import { BasePage } from './base'
import { AccountPage } from './account'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join('..', '.env') })

exports.ProductPage = class ProductPage extends BasePage {
    constructor(page, isMobile) {
        super(page, isMobile)

        this.accountPage = new AccountPage(page, isMobile)

        this.newArrivals = page.locator('#newarrivals')
        this.categoryLocator = page.locator('.category-item')
        this.productLocator = page.locator('.product-tile')
        this.productTitle = page.locator('.product-name')

        this.sizeSelect = page.locator('#size-1')
        this.widthSelect = page.locator('#width-1')
        this.addToCartLocator = page.locator('.add-to-cart')
    }

    async getProduct() {
        await this.newArrivals.click()
        await this.page.waitForTimeout(5000)
        const categories = await this.categoryLocator
        await categories.first().click()
        await this.page.waitForLoadState('networkidle')
        const products = await this.productLocator
        await products.first().click()
        await this.page.waitForLoadState('networkidle')
        const productTitle = await this.productTitle.first().innerHTML()
        return productTitle
    }

    async addToCart() {
        await this.selectSize()
        await this.selectWidth()
        await this.addToCartLocator.click()
    }

    async selectSize() {
        if (await this.sizeSelect.isVisible()) {
            const options = await this.sizeSelect.locator('option')
            const optVal = await options.last().getAttribute('value')
            await this.sizeSelect.selectOption({ value: optVal })
        }
        return
    }

    async selectWidth() {
        if (await this.widthSelect.isVisible()) {
            const options = await this.widthSelect.locator('option')
            const optVal = await options.last().getAttribute('value')
            await this.widthSelect.selectOption({ value: optVal })
        }
        return
    }

    async visitPDP() {
        await this.newArrivals.click()
        await this.page.waitForTimeout(5000)
        const categories = await this.categoryLocator
        await categories.first().click()
        await this.page.waitForLoadState('networkidle')
        const products = await this.productLocator
        await products.first().click()
        await this.page.waitForLoadState('networkidle')
    }

    async visitPLP() {
        await this.newArrivals.click()
        await this.page.waitForTimeout(5000)
        const categories = await this.categoryLocator
        await categories.first().click()
        await this.page.waitForLoadState('networkidle')
    }
}