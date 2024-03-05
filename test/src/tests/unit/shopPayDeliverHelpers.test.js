const { assert } = require('chai')
const path = require('path')

const BasketMgr = require('../mocks/dw.order.BasketMgr')
const basket = BasketMgr.getCurrentBasket()

const { mockDeliverDateHelpers } = require('../mocks/filesProxyquire')

describe('int_shoppay/cartridge/scripts/shoppay/helpers/deliveryDateHelpers.js', () => {

    it('should retrieve the minimum expected delivery date for a shipping method', () => {
        const currentDate = new Date()
        const minShippingDate = new Date(currentDate)
        minShippingDate.setDate(currentDate.getDate() + 1)
        const expectedResult = minShippingDate.toISOString().split('T')[0]
        assert.strictEqual(mockDeliverDateHelpers.getMinDeliveryDate(), expectedResult)
    })

    it('should retrieve the maximum expected delivery date for a shipping method', () => {
        const currentDate = new Date()
        const maxShippingDate = new Date(currentDate)
        maxShippingDate.setDate(currentDate.getDate() + 7)
        const expectedResult = maxShippingDate.toISOString().split('T')[0]
        assert.strictEqual(mockDeliverDateHelpers.getMaxDeliveryDate(), expectedResult)
    })
})
