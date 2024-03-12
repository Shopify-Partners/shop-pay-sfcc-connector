import { test, expect } from '@playwright/test'
import { CheckoutPage } from '../e2e/page-objects/checkout.js'

const discountChangeCtrl = 'ShopPay-DiscountCodeChanged'
const shippingAddressCtrl = 'ShopPay-ShippingAddressChanged'
const deliveryMethodCtrl = 'ShopPay-DeliveryMethodChanged'

let checkoutPage
let siteUrl
let baseUrl

test.beforeEach(async ({ page, isMobile }) => {
    checkoutPage = new CheckoutPage(page, isMobile)
    await checkoutPage.goHome()
    await checkoutPage.acceptCookies()
    siteUrl = checkoutPage.siteUrl
    baseUrl = checkoutPage.baseUrl
})

// The following tests verify the functionality of these Jira Issue:
// https://themazegroup.atlassian.net/browse/SSPSC-25, https://themazegroup.atlassian.net/browse/SSPSC-26
test.describe('Test backend handlers for processing data from frontend listeners', () => {

    test('Test backend listener for changes in the discounts object => ShopPay-DiscountCodeChanged', async ({ page }) => {
        const fiveTiesProduct = `${baseUrl}/checked-silk-tie/25752235M.html?lang=en_US&dwvar_25752235M_color=YELLOSI`
        const fiveShoesProduct = `${baseUrl}/incase/25778945M.html?lang=en_US`

        await page.goto(fiveTiesProduct)
        await checkoutPage.acceptCookies()
        await checkoutPage.productPage.addToCart()
        await page.goto(fiveShoesProduct)
        await checkoutPage.productPage.updateQuantity('6')
        await checkoutPage.productPage.selectSize()
        await checkoutPage.productPage.addToCartLocator.click()
        await page.waitForLoadState('domcontentloaded')
        await checkoutPage.goToCart()
        await page.waitForLoadState('domcontentloaded')

        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const changeDiscountUrl = `${siteUrl}/default/${discountChangeCtrl}?csrf_token=${csrfToken}`

        const sessionResponse = await page.evaluate(async (changeDiscountUrl) => {
            const response = await fetch(changeDiscountUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    discountCodes: ['5ties','shipping']
                })
            })

            return await response.json()
        }, changeDiscountUrl)

        expect(sessionResponse.error).toBe(false)
    })

    test('Test backend listener for shipping address changes => ShopPay-ShippingAddressChanged', async ({ page }) => {
        let email
        let shippingData = {
            firstName: 'Benny',
            lastName: 'Benson',
            phone: '3125551212',
            address1: '2101 SPAR AVE',
            country: 'US',
            state: 'AK',
            city: 'ANCHORAGE',
            postal: '99501',
        }
        const shippingChangeData = {
            shippingAddress: {
                firstName: 'Product',
                lastName: 'Automation',
                phone: '7777777777',
                address1: '4321 First Last Lane',
                address2: '',
                city: 'West Palm Beach',
                provinceCode: 'FL',
                postalCode: '33405',
                email: 'shake_n_bake@mailinator.com',
                companyName: null,
                countryCode: 'US'
            }
        }
        const paymentData = {
            ccn: '4111 1111 1111 1111'
        }

        email = await checkoutPage.generateEmail()
        shippingData.email = email
        await checkoutPage.productPage.getProduct()
        await checkoutPage.productPage.addToCart()
        await checkoutPage.startCheckout()
        await checkoutPage.enterGuestEmail(email)
        await checkoutPage.fillShippingForm(shippingData)

        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const changeShippingUrl = `${siteUrl}/default/${shippingAddressCtrl}?csrf_token=${csrfToken}`

        const shippingResponse = await page.evaluate(async ({ changeShippingUrl, shippingChangeData }) => {
            const response = await fetch(changeShippingUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shippingChangeData)
            })

            return await response.json()
        }, { changeShippingUrl: changeShippingUrl, shippingChangeData })

        expect(shippingResponse.error).toBe(false)

        await checkoutPage.fillPaymentForm(paymentData)
        await checkoutPage.paymentLocator.click()
        await page.waitForTimeout(3000)

        expect(checkoutPage.orderFirstName.first()).toHaveText(shippingChangeData.shippingAddress.firstName)
        expect(checkoutPage.orderLastName.first()).toHaveText(shippingChangeData.shippingAddress.lastName)
        expect(checkoutPage.orderAddress1.first()).toHaveText(shippingChangeData.shippingAddress.address1)
        expect(checkoutPage.orderCity.first()).toHaveText(shippingChangeData.shippingAddress.city)
        expect(checkoutPage.orderState.first()).toHaveText(shippingChangeData.shippingAddress.provinceCode)
        expect(checkoutPage.orderPostal.first()).toHaveText(shippingChangeData.shippingAddress.postalCode)
    })

    test('Test backend listener for delivery method changes => ShopPay-DeliveryMethodChanged', async ({ page }) => {
        const deliveryMethodUpdate = {
            deliveryMethod: {
                label: '2-Day Express',
                amount: {
                    amount: 9.99,
                    currencyCode: 'USD'
                },
                code: '002'
            }
        }
        await checkoutPage.productPage.getProduct()
        await checkoutPage.productPage.addToCart()
        await checkoutPage.goToCart()
        await page.waitForLoadState('domcontentloaded')

        const selectedDeliveryOption = await page.evaluate(() => {
            const deliveryOptions = document.getElementById('shippingMethods')
            const selectedOption = deliveryOptions.querySelector('option[selected]')
            return selectedOption.innerText
        })
        expect(selectedDeliveryOption).toContain('Ground (7-10 Business Days)')

        const csrfSelector = page.locator('[data-tokenname="csrf_token"]')
        const csrfToken = await csrfSelector.getAttribute('data-token')
        const changeShipMethodUrl = `${siteUrl}/default/${deliveryMethodCtrl}?csrf_token=${csrfToken}`

        const shippingResponse = await page.evaluate(async ({ changeShipMethodUrl, deliveryMethodUpdate }) => {
            const response = await fetch(changeShipMethodUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(deliveryMethodUpdate)
            })

            return await response.json()
        }, { changeShipMethodUrl: changeShipMethodUrl, deliveryMethodUpdate })

        expect(shippingResponse.error).toBe(false)

        await page.reload({ waitUntil: 'domcontentloaded' })

        const updatedDeliveryOption = await page.evaluate(() => {
            const deliveryOptions = document.getElementById('shippingMethods')
            const selectedOption = deliveryOptions.querySelector('option[selected]')
            return selectedOption.innerText
        })
        expect(updatedDeliveryOption).toContain('2-Day Express (2 Business Days)')
    })
})
