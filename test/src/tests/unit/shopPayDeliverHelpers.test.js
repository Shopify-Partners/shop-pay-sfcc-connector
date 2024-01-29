const { assert } = require('chai')
const path = require('path')

const BasketMgr = require('../mocks/dw.order.BasketMgr')
const basket = BasketMgr.getCurrentBasket()

const { mockDeliverDateHelpers } = require('../mocks/filesProxyquire')

describe('int_shoppay/cartridge/scripts/shoppay/helpers/deliveryDateHelpers.js', () => {

    const formatDate = (date, value) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate() + value).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    it('should retrieve the minimum expected delivery date for a shipping method', () => {
        const date = new Date()
        const expectedResult = formatDate(date, 1)
        assert.strictEqual(mockDeliverDateHelpers.getMinDeliveryDate(), expectedResult)
    })

    it('should retrieve the maximum expected delivery date for a shipping method', () => {
        const date = new Date()
        const expectedResult = formatDate(date, 7)
        assert.strictEqual(mockDeliverDateHelpers.getMaxDeliveryDate(), expectedResult)
    })
})
