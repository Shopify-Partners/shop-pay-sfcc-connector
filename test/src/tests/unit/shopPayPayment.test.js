const { assert } = require('chai')
const path = require('path')

const BasketMgr = require('../mocks/dw.order.BasketMgr')
const basket = BasketMgr.getCurrentBasket()

const { mockPaymentHelpers } = require('../mocks/filesProxyquire')

require('dw-api-mock/demandware-globals')

describe('int_shoppay/cartridge/scripts/shoppay/helpers/paymentHelpers.js', () => {

    it('should return the Shop Pay payment token from the Shop Pay payment instrument', () => {
        expectedResult = 'getYaTokensHere'
        assert.strictEqual(mockPaymentHelpers.getPaymentMethod(basket), expectedResult)
    })

    it('should return the 3-digit ISO currency code for the customer\'s basket', () => {
        const expectedResult = 'USD'
        assert.strictEqual(mockPaymentHelpers.getPresentmentCurrency(basket), expectedResult)
    })

    it('should return the 2-digit language code for the current session', () => {
        const expectedResult = 'US'
        assert.strictEqual(mockPaymentHelpers.getLocale(), expectedResult)
    })
})
