import { test, expect } from '@playwright/test'
import { CheckoutPage } from '../e2e/page-objects/checkout.js';
import axios from 'axios';

const cartSummaryCtrl = 'ShopPay-GetCartSummary'

let checkoutPage

// The following test Jira Issue: https://themazegroup.atlassian.net/browse/SSPSC-23
test.beforeEach(async ({ page, isMobile }) => {
    checkoutPage = new CheckoutPage(page, isMobile)
    await checkoutPage.goHome()
    await checkoutPage.acceptCookies()
})

test.describe('Test GetCartSummary CSRF', () => {
    test('Verify request cannot be processed outside of the client session', async ({ page }) => {
        const BASE_URL = checkoutPage.baseUrl
        await checkoutPage.productPage.getProduct()
        await checkoutPage.productPage.addToCart()
        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const url = `${BASE_URL}/default/${cartSummaryCtrl}?csrf_token=${csrfToken}`

        try {
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return True
        } catch (error) {
            expect(error.response.status).toBe(500)
        }
    })

    test('Verify payment object is returned within a valid client session', async ({ page, browser }) => {
        const BASE_URL = checkoutPage.baseUrl
        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const url = `${BASE_URL}/default/${cartSummaryCtrl}?csrf_token=${csrfToken}`

        await checkoutPage.productPage.getProduct()
        await checkoutPage.productPage.addToCart()

        const result = await page.evaluate(async (url) => {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })

            return await response.json()
        }, url)

        expect(result.error).toBe(false)
    })
})
