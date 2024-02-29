import { test, expect } from '@playwright/test'
import { CheckoutPage } from '../e2e/page-objects/checkout.js'
import axios from 'axios';

const cartSummaryCtrl = 'ShopPay-GetCartSummary'
const sessionCtrl = 'ShopPay-BeginSession'
const submitPaymentCtrl = 'ShopPay-SubmitPayment'

let checkoutPage
let siteUrl

test.beforeEach(async ({ page, isMobile }) => {
    checkoutPage = new CheckoutPage(page, isMobile)
    await checkoutPage.goHome()
    await checkoutPage.acceptCookies()
    siteUrl = checkoutPage.siteUrl
})

test.describe('Test sessions and submit order controllers', () => {
    // Jira Issue: https://themazegroup.atlassian.net/browse/SSPSC-23
    test('Verify ShopPay payment object is returned => ShopPay-GetCartSummary', async ({ page }) => {
        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const cartSummaryUrl = `${siteUrl}/default/${cartSummaryCtrl}?csrf_token=${csrfToken}`

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

    // Jira Issue: https://themazegroup.atlassian.net/jira/software/c/projects/SSPSC/issues/SSPSC-22
    test('Verify ShopPay GraphQL request response => ShopPay-BeginSession', async ({ page }) => {
        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const cartSummaryUrl = `${siteUrl}/default/${cartSummaryCtrl}?csrf_token=${csrfToken}`
        const sessionUrl = `${siteUrl}/default/${sessionCtrl}?csrf_token=${csrfToken}`

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

        const requestData = {
            csrf_token: csrfToken,
            paymentRequest: cartResponse.paymentRequest,
        }

        const sessionResponse = await page.evaluate(async ({ sessionUrl, requestData }) => {
            const response = await fetch(`${sessionUrl}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData)
            })

            return response.json()
          }, { sessionUrl: sessionUrl, requestData })

          expect(sessionResponse.error).toBe(false)
    })

    // Jira Issue: https://themazegroup.atlassian.net/browse/SSPSC-30
    test('Verify ShopPay GraphQL place order functionality => ShopPay-SubmitPayment', async ({ page }) => {
        let email
        let paymentRequest
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
        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const cartSummaryUrl = `${siteUrl}/default/${cartSummaryCtrl}?csrf_token=${csrfToken}`
        const sessionUrl = `${siteUrl}/default/${sessionCtrl}?csrf_token=${csrfToken}`
        const submitPaymentUrl = `${siteUrl}/default/${submitPaymentCtrl}?csrf_token=${csrfToken}`

        email = await checkoutPage.generateEmail()
        testData.email = email
        await checkoutPage.productPage.getProduct()
        await checkoutPage.productPage.addToCart()
        await checkoutPage.startCheckout()
        await checkoutPage.enterGuestEmail(email)
        await checkoutPage.fillShippingForm(testData)

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

        const requestData = {
            csrf_token: csrfToken,
            paymentRequest: cartResponse.paymentRequest,
        }

        const sessionResponse = await page.evaluate(async ({ sessionUrl, requestData }) => {
            const response = await fetch(`${sessionUrl}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData)
            })

            return response.json()
        }, { sessionUrl: sessionUrl, requestData })

        const token = sessionResponse.token
        paymentRequest = cartResponse.paymentRequest
        paymentRequest.paymentMethod = token

        const paymentData = {
            token: token,
            paymentRequest: paymentRequest
        }

        const paymentResponse = await page.evaluate(async ({ submitPaymentUrl, paymentData }) => {
            const response = await fetch(`${submitPaymentUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            })

            return response.json()
        }, { submitPaymentUrl: submitPaymentUrl, paymentData })

        await page.waitForLoadState('domcontentloaded')

        expect(paymentResponse.error).toBe(false)
        expect(paymentResponse.continueUrl).not.toBe(undefined)
    })

    // Jira Issue: https://themazegroup.atlassian.net/browse/SSPSC-23
    test('Verify request cannot be processed outside of the client session (CSRF)', async ({ page }) => {
        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const url = `${siteUrl}/default/${cartSummaryCtrl}?csrf_token=${csrfToken}`

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
})
