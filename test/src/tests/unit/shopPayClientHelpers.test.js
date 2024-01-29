const path = require('path')
const sinon = require('sinon')
const { assert, expect } = require('chai')
const jsdom = require('jsdom')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

const { JSDOM } = jsdom

require('app-module-path').addPath(path.join(process.cwd(), '../cartridges'))

const {
    getCsrfToken,
    setSessionListeners,
    isCartEmptyOnLoad,
} = require('../../../../cartridges/int_shoppay_sfra/cartridge/client/default/js/helpers/shoppayHelper.js')

describe('int_shoppay_sfra/cartridge/client/default/js/helpers/shoppayHelper.js', () => {
    let mockDom
    const mockCsrfToken = 'zyxwvutsrqponmlkjihgfedcba'
    mockDom = new JSDOM(`<!DOCTYPE html><div data-csrf-token=${mockCsrfToken}></div>`)
    const mockDomain = 'https://example.commercecloud.salesforce.com'
    const mockUrl = 'https://example.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/en_US/ShopPay-GetCartSummary'

    beforeEach(() => {
        global.document = mockDom.window.document
        global.window = mockDom.window
    })

    afterEach(() => {
        global.document = undefined
        global.window = undefined
    })

    it('returns token value when data-csrf-token attribute exists', () => {
        expect(getCsrfToken(mockDom)).to.equal('zyxwvutsrqponmlkjihgfedcba')
    })

    it('verifies the ability to add a csrf token param to a sfra url', () => {
        const mockShoppayHelper = proxyquire('int_shoppay_sfra/cartridge/client/default/js/helpers/shoppayHelper.js', {})

        const expectedResult = `${mockUrl}?csrf_token=${mockCsrfToken}`
        const mockLocation = {
            location: {
                origin: mockDomain
            }
        }

        const mockResponse = mockShoppayHelper.getUrlWithCsrfToken(mockUrl, location=mockLocation)
        expect(mockResponse).to.equal(expectedResult)
    })

    it('verifies ShopPay listener Event name conventions', () => {
        const expectedResults = [
            'sessionrequested',
            'discountcodechanged',
            'deliverymethodchanged',
            'shippingaddresschanged',
            'paymentconfirmationrequested',
            'paymentcomplete'
        ]
        let returnedListeners = []

        const mockSession = {
            addEventListener: (eventName, callback) => {
                returnedListeners.push(eventName)
            }
        }
        setSessionListeners(mockSession)
        expect(returnedListeners).to.deep.equal(expectedResults)
    })
})
