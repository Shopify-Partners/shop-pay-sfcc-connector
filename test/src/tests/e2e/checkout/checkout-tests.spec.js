import { test, expect } from '@playwright/test'
import { CheckoutPage } from '../page-objects/checkout.js'

let testData = {
    firstName: 'Product',
    lastName: 'Automation',
    phone: '7777777777',
    password: 'Abcd1234$$',
    address1: '4321 First Last Lane',
    country: 'US',
    state: 'FL',
    city: 'West Palm Beach',
    postal: '33405',
}

const paymentData = {
    ccn: '4111 1111 1111 1111'
}

let email
let checkoutPage

test.beforeEach(async ({ page, isMobile }) => {
    checkoutPage = new CheckoutPage(page, isMobile)
    await checkoutPage.goHome()
    await checkoutPage.acceptCookies()
})

test.describe('Test Checkout', () => {
    test('Enter standard checkout flow and verify order submission', async ({ page }) => {
        email = await checkoutPage.generateEmail()
        testData.email = email
        await checkoutPage.productPage.getProduct()
        await checkoutPage.productPage.addToCart()
        await checkoutPage.startCheckout()
        await checkoutPage.enterGuestEmail(email)
        await checkoutPage.fillShippingForm(testData)
        await checkoutPage.fillPaymentForm(paymentData)
        await checkoutPage.paymentLocator.click()
        await page.waitForLoadState('domcontentloaded')
        await checkoutPage.placeOrderLocator.click()
        await page.waitForTimeout(3000)
        expect(await page.innerText('h1.page-title')).toBe('Thank You')
    })
})
