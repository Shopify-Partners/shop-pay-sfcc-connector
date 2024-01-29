const { assert } = require('chai')
const sinon = require('sinon')
const path = require('path')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

require('dw-api-mock/demandware-globals')
require('app-module-path').addPath(path.join(process.cwd(), '../cartridges'))

const Site = require('../mocks/dw.system.Site')
const LocalServiceRegistryMock = require('../mocks/dw.svc.LocalServiceRegistry')

describe('int_shoppay/cartridge/scripts/shoppay/service/shopPayStorefrontService.js', () => {

    const service = {
        configuration: {
          credential: {
            getURL: sinon.stub().returns('https://shoppay.my.shopify.com/{store_name}/{storefront_api_version}')
          }
        },
        addHeader: sinon.stub(),
        setRequestMethod: sinon.stub(),
        setURL: sinon.stub()
    }

    const ShopPayStorefrontService = proxyquire('int_shoppay/cartridge/scripts/shoppay/service/shoppayStorefrontService', {
        'dw/svc/LocalServiceRegistry': LocalServiceRegistryMock,
        'dw/system/Site': Site,
        '*/cartridge/scripts/shoppay/helpers/serviceHelpers': require('int_shoppay/cartridge/scripts/shoppay/helpers/serviceHelpers.js')
    })

    afterEach(() => {
        sinon.restore()
    })

    it('should return a Storefront Payment Request object', () => {
        const mockRequest = '{"variables":{"paymentRequest":{"shippingAddress":null,"discountCodes":[],"lineItems":[{"label":"Floral Shirt Dress.","quantity":1,"sku":"701644257958M","requiresShipping":true,"image":{"url":"https://production-sitegenesis-dw.demandware.net/on/demandware.static/-/Sites-apparel-m-catalog/default/dw0ec4be15/images/medium/PG.10249590.JJ2RRXX.PZ.jpg","alt":"Floral Shirt Dress.,Ivory Multi,small"},"finalLinePrice":{"amount":148,"currencyCode":"USD"},"finalItemPrice":{"amount":148,"currencyCode":"USD"}}],"shippingLines":[{"label":"Ground","amount":{"amount":7.99,"currencyCode":"USD"},"code":"001"}],"deliveryMethods":[],"locale":"en","presentmentCurrency":"USD","subtotal":{"amount":148,"currencyCode":"USD"},"discounts":[],"totalShippingPrice":{"discounts":[],"originalTotal":{"amount":7.99,"currencyCode":"USD"},"finalTotal":{"amount":7.99,"currencyCode":"USD"}},"totalTax":{"amount":7.8,"currencyCode":"USD"},"total":{"amount":163.79,"currencyCode":"USD"}}}}'

        const requestResult = ShopPayStorefrontService().getRequestLogMessage(mockRequest)
        assert.deepEqual(requestResult, mockRequest)
    })

    it('should return the shopPayPaymentRequestSessionCreate object', () => {
        const mockedSessionReq = {text: '{"data":{"shopPayPaymentRequestSessionCreate":{"shopPayPaymentRequestSession":{"sourceIdentifier":"xyz123","token":"db4eede13822684b13a607823b7ba40d","checkoutUrl":"https://shop.app/checkout/1/spe/db4eede13822684b13a607823b7ba40d/shoppay","paymentRequest":{"shippingAddress":null,"discountCodes":[],"lineItems":[{"label":"Floral Shirt Dress.","quantity":1,"sku":"701644257958M","requiresShipping":true,"image":{"url":"https://production-sitegenesis-dw.demandware.net/on/demandware.static/-/Sites-apparel-m-catalog/default/dw0ec4be15/images/medium/PG.10249590.JJ2RRXX.PZ.jpg","alt":"Floral Shirt Dress.,Ivory Multi,small"},"finalLinePrice":{"amount":148,"currencyCode":"USD"},"finalItemPrice":{"amount":148,"currencyCode":"USD"}}],"shippingLines":[{"label":"Ground","amount":{"amount":7.99,"currencyCode":"USD"},"code":"001"}],"deliveryMethods":[],"locale":"en","presentmentCurrency":"USD","subtotal":{"amount":148,"currencyCode":"USD"},"discounts":[],"totalShippingPrice":{"discounts":[],"originalTotal":{"amount":7.99,"currencyCode":"USD"},"finalTotal":{"amount":7.99,"currencyCode":"USD"}},"totalTax":{"amount":7.8,"currencyCode":"USD"},"total":{"amount":163.79,"currencyCode":"USD"}}}},"userErrors":[]}}'}

        const expectedResult = '{"data":{"shopPayPaymentRequestSessionCreate":{"shopPayPaymentRequestSession":{"sourceIdentifier":"xyz123","token":"****","checkoutUrl":"https://shop.app/checkout/1/spe/db4eede13822684b13a607823b7ba40d/shoppay","paymentRequest":{"shippingAddress":null,"discountCodes":[],"lineItems":[{"label":"Floral Shirt Dress.","quantity":1,"sku":"701644257958M","requiresShipping":true,"image":{"url":"https://production-sitegenesis-dw.demandware.net/on/demandware.static/-/Sites-apparel-m-catalog/default/dw0ec4be15/images/medium/PG.10249590.JJ2RRXX.PZ.jpg","alt":"Floral Shirt Dress.,Ivory Multi,small"},"finalLinePrice":{"amount":148,"currencyCode":"USD"},"finalItemPrice":{"amount":148,"currencyCode":"USD"}}],"shippingLines":[{"label":"Ground","amount":{"amount":7.99,"currencyCode":"USD"},"code":"001"}],"deliveryMethods":[],"locale":"en","presentmentCurrency":"USD","subtotal":{"amount":148,"currencyCode":"USD"},"discounts":[],"totalShippingPrice":{"discounts":[],"originalTotal":{"amount":7.99,"currencyCode":"USD"},"finalTotal":{"amount":7.99,"currencyCode":"USD"}},"totalTax":{"amount":7.8,"currencyCode":"USD"},"total":{"amount":163.79,"currencyCode":"USD"}}}},"userErrors":[]}}'

        const mockResponse = ShopPayStorefrontService().getResponseLogMessage(mockedSessionReq)
        assert.deepEqual(mockResponse, expectedResult)
    })

    it('should handle a mocked session request', () => {
        const paramsMock = '{"variables": {"token": "db4eede13822684b13a607823b7ba40d"}}'
        const expectedText = '{"data":{"shopPayPaymentRequestSessionSubmit":{"paymentRequestReceipt":{"token":"a607823b7ba40ddb4eede13822684b13","processingStatusType":"ready"},"userErrors":[]}}}'

        const mockResult = ShopPayStorefrontService().mockCall('', paramsMock)
        assert.deepEqual(mockResult, {
          statusCode: 200,
          statusMessage: 'success',
          text: expectedText
        })
    })
})
