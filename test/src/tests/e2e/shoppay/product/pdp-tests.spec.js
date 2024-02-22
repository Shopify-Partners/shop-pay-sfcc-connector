import { test, expect } from '@playwright/test'
import { ProductPage } from '../../page-objects/product.js'

let email
let productPage

let testData = {}

test.beforeEach(async ({ page, isMobile }) => {
    productPage = new ProductPage(page, isMobile)
    await productPage.goHome()
    await productPage.acceptCookies()
})

test.describe('Test PDP', () => {
    test('Verify ShopPay modal functions', async ({ page }) => {
        email = await productPage.generateEmail()
        testData.email = email
        await productPage.getProduct()
        await productPage.addToCart()
        const shopPayModal = await productPage.shopPayPayment(email)
        expect(shopPayModal.url()).toContain('shop.app')
    })
})
