import { test, expect } from '@playwright/test'
import { CheckoutPage } from '../../e2e/page-objects/checkout.js'
import axios from 'axios';

const cartSummaryCtrl = 'ShopPay-GetCartSummary'
const sessionCtrl = 'ShopPay-BeginSession'

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
        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const url = `${BASE_URL}/default/${cartSummaryCtrl}?csrf_token=${csrfToken}`

        await checkoutPage.productPage.getProduct()
        await checkoutPage.productPage.addToCart()

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

    test('Verify payment object is returned within a valid client session', async ({ page }) => {
        const BASE_URL = checkoutPage.baseUrl
        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const cartSummaryUrl = `${BASE_URL}/default/${cartSummaryCtrl}?csrf_token=${csrfToken}`

        await checkoutPage.productPage.getProduct()
        await checkoutPage.productPage.addToCart()

        const cartResponse = await page.evaluate(async (cartSummaryUrl) => {
            const response = await fetch(cartSummaryUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })

            return await response.json()
        }, cartSummaryUrl)

        expect(cartResponse.error).toBe(false)
    })

    // The following test Jira Issue: https://themazegroup.atlassian.net/jira/software/c/projects/SSPSC/issues/SSPSC-22
    // test('Verify Shop Pay GraphQL request response', async ({ page }) => {
    //     const BASE_URL = checkoutPage.baseUrl
    //     const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
    //     const csrfToken = await csrfSelector.getAttribute('data-token')
    //     const cartSummaryUrl = `${BASE_URL}/default/${cartSummaryCtrl}?csrf_token=${csrfToken}`
    //     const sessionUrl = `${BASE_URL}/default/${sessionCtrl}`

    //     await checkoutPage.productPage.getProduct()
    //     await checkoutPage.productPage.addToCart()

    //     const cartResponse = await page.evaluate(async (cartSummaryUrl) => {
    //         const response = await fetch(cartSummaryUrl, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //         })

    //         return await response.json()
    //     }, cartSummaryUrl)

    //     expect(cartResponse.error).toBe(false)

    //     const requestData = {
    //         csrf_token: csrfToken,
    //         paymentRequest: JSON.stringify(cartResponse.paymentRequest),
    //     }

    //     const sessionResponse = await page.evaluate(async ({ sessionUrl, requestData }) => {
    //         const response = await fetch(`${sessionUrl}`, {
    //           method: 'POST',
    //           headers: {
    //             'Content-Type': 'application/json',
    //           },
    //           body: requestData
    //         })

    //         return response.json()
    //       }, { sessionUrl: sessionUrl, requestData })

    //       console.log(requestData)
    //       console.log(sessionResponse)

    //       expect(sessionResponse.error).toBe(false)
    // })
})
