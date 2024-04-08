import { expect } from '@playwright/test'
import path from 'path'
import { BasePage } from './base'
import { ProductPage } from './product'
import { AccountPage } from './account'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join('..', '.env') })

const { BASE_URL } = process.env

exports.CheckoutPage = class CheckoutPage extends BasePage {
    constructor(page, isMobile) {
        super(page, isMobile)

        this.productPage = new ProductPage(page, isMobile)
        this.accountPage = new AccountPage(page, isMobile)

        // Shipping form
        this.guestEmailInput = '#email-guest'
        this.guestCheckoutSubmit = page.locator('.submit-customer')
        this.shippingFnameLocator = page.locator('#shippingFirstNamedefault')
        this.shippingLnameLocator = page.locator('#shippingLastNamedefault')
        this.shippingAddressLocator = page.locator('#shippingAddressOnedefault')
        this.countryLocator = page.locator('#shippingCountrydefault')
        this.stateLocator = page.locator('#shippingStatedefault')
        this.cityLocator = page.locator('#shippingAddressCitydefault')
        this.postCodeLocator = page.locator('#shippingZipCodedefault')
        this.phoneLocator = page.locator('#shippingPhoneNumberdefault')
        this.submitShippingLocator = page.locator('.submit-shipping')

        // Payment form
        this.cardNumberLocator = page.locator('#cardNumber')
        this.cardExpMonth = page.locator('#expirationMonth')
        this.cardExpYear = page.locator('#expirationYear')
        this.securityCode = page.locator('#securityCode')
        this.paymentLocator = page.locator('.submit-payment')
        this.placeOrderLocator = page.locator('.place-order')

        // Cart
        this.minicartLocator = page.locator('.minicart')
        this.cartCheckoutLocator = page.locator('.checkout-btn')
        this.cartShippingMethod = page.getByLabel('Shipping')

        // Place Order
        this.orderFirstName = page.locator('.firstName')
        this.orderLastName = page.locator('.lastName')
        this.orderAddress1 = page.locator('.address1')
        this.orderCity = page.locator('.city')
        this.orderState = page.locator('.stateCode')
        this.orderPostal = page.locator('.postalCode')
    }

    async goToCart() {
        await this.minicartLocator.click()
    }

    async startCheckout() {
        await this.minicartLocator.click()
        await this.page.waitForLoadState('domcontentloaded')
        await this.cartCheckoutLocator.click()
        await this.page.waitForLoadState('domcontentloaded')
    }

    async enterGuestEmail(email) {
        await this.page.locator(this.guestEmailInput).fill(email)
        await this.guestCheckoutSubmit.click()
    }

    async fillShippingForm(data) {
        await this.shippingFnameLocator.fill(data.firstName)
        await this.shippingLnameLocator.fill(data.lastName)
        await this.shippingAddressLocator.fill(data.address1)
        await this.cityLocator.fill(data.city)
        await this.countryLocator.locator('option')
        await this.countryLocator.selectOption({ value: data.country })
        await this.stateLocator.locator('option')
        await this.stateLocator.selectOption({ value: data.state })
        await this.postCodeLocator.fill(data.postal)
        await this.phoneLocator.fill(data.phone)
        await this.submitShippingLocator.click()
        await this.page.waitForTimeout(3000)
    }

    async fillPaymentForm(data) {
        await this.cardNumberLocator.fill(data.ccn)
        await this.page.keyboard.press('Tab')
        const months = await this.cardExpMonth.locator('option')
        const monthVal = await months.last().getAttribute('value')
        await this.cardExpMonth.selectOption({ value: monthVal })
        const years = await this.cardExpYear.locator('option')
        const yearVal = await years.last().getAttribute('value')
        await this.cardExpYear.selectOption({ value: yearVal })
        await this.securityCode.fill('123')
        // await this.paymentLocator.click()
        // await this.page.waitForLoadState('networkidle')
        // await this.placeOrderLocator.click()
        // await this.page.waitForLoadState('networkidle')
    }
}
