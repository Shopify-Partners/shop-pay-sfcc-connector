const { assert } = require('chai')
const path = require('path')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

const collections = require('../mocks/util/collections')
const BasketMgr = require('../mocks/dw.order.BasketMgr')
const ProductMgr = require('../mocks/dw.catalog.ProductMgr')

const basket = BasketMgr.getCurrentBasket()

const {
    mockDiscountHelpers,
    mockDeliverDateHelpers,
    mockShippingHelpers,
    mockTotalsHelpers,
    mockPaymentHelpers,
    mockShoppayGlobalRefs,
    mockCommon,
} = require('../mocks/filesProxyquire')

require('dw-api-mock/demandware-globals')
require('app-module-path').addPath(path.join(process.cwd(), '../cartridges'))

const ProductImagesModel = proxyquire('../../../../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/models/product/productImages', {
    '*/cartridge/scripts/util/collections': collections
})

const mockProductLineItemHelpers = proxyquire('int_shoppay/cartridge/scripts/shoppay/helpers/productLineItemHelpers.js', {
    '*/cartridge/scripts/factories/price': {
        getPrice: function () {
            return {
                list: {
                    value: 6.66,
                    currency: 'USD'
                },
                sales: {
                    value: 6.66,
                    currency: 'USD'
                }
            }
        }
    },
    '*/cartridge/scripts/util/collections': collections,
    '*/cartridge/scripts/shoppayGlobalRefs': mockShoppayGlobalRefs,
    '*/cartridge/scripts/shoppay/helpers/eDeliveryHelpers': require('int_shoppay/cartridge/scripts/shoppay/helpers/eDeliveryHelpers.js'),
    '*/cartridge/scripts/shoppay/shoppayCommon': mockCommon,
    'dw/campaign/PromotionMgr':  {
        activeCustomerPromotions: {
            getProductPromotions: function () {
                return {
                    name: 'preWorkout'
                }
            }
        }
    },
    '*/cartridge/models/product/productImages': ProductImagesModel,
    '*/cartridge/scripts/helpers/productHelpers': {
        getCurrentOptionModel: function () {
            return []
        },
        getLineItemOptions: function () {
            return []
        }
    }
})

describe('int_shoppay_sfra/cartridge/models/paymentRequest.js => PaymentRequest', () => {
    const ShopPayPaymentRequest = proxyquire('int_shoppay_sfra/cartridge/models/paymentRequest', {
        '*/cartridge/scripts/shoppay/helpers/paymentHelpers': mockPaymentHelpers,
        '*/cartridge/scripts/shoppay/helpers/discountHelpers': mockDiscountHelpers,
        '*/cartridge/scripts/shoppay/helpers/productLineItemHelpers': mockProductLineItemHelpers,
        '*/cartridge/scripts/shoppay/helpers/shippingHelpers': mockShippingHelpers,
        '*/cartridge/scripts/shoppay/helpers/totalsHelpers': mockTotalsHelpers
    })

    it('should return a ShopPay payment request lineItem', () => {
        const expectedResult = {
            label: 'Belle de Teint',
            quantity: 1,
            sku: 'M1234',
            requiresShipping: true,
            image: { url: 'https://sforce.co/43Pig4s', alt: 'First Image' },
            originalLinePrice: { amount: 21.12, currencyCode: 'USD' },
            lineDiscounts: [ { label: '', amount: { amount: 6.66, currencyCode: 'USD' } } ],
            finalLinePrice: { amount: 13.13, currencyCode: 'USD' },
            originalItemPrice: { amount: 6.66, currencyCode: 'USD' },
            finalItemPrice: { amount: 6.66, currencyCode: 'USD' }
        }

        const mockPaymentRequest = new ShopPayPaymentRequest(basket)
        const mockResponse = mockPaymentRequest.lineItems[0]
        assert.deepEqual(mockResponse, expectedResult)
    })

    it('should return the product label', () => {
        const mockRequest = new ShopPayPaymentRequest(basket)
        const mockLineItemsResponse = mockRequest.lineItems[0]
        assert.deepEqual(mockLineItemsResponse.label, 'Belle de Teint')
    })

    it('should return the product quantity', () => {
        const mockRequest = new ShopPayPaymentRequest(basket)
        const mockLineItemsResponse = mockRequest.lineItems[0]
        assert.deepEqual(mockLineItemsResponse.quantity, 1)
    })


    it('should return the product SKU', () => {
        const mockRequest = new ShopPayPaymentRequest(basket)
        const mockLineItemsResponse = mockRequest.lineItems[0]
        assert.deepEqual(mockLineItemsResponse.sku, 'M1234')
    })

    it('should return the product image details', () => {
        const expectedResult = {
            url: 'https://sforce.co/43Pig4s',
            alt: 'First Image'
        }
        const mockRequest = new ShopPayPaymentRequest(basket)
        const mockLineItemsResponse = mockRequest.lineItems[0]
        assert.deepEqual(mockLineItemsResponse.image, expectedResult)
    })

    it('should return the originalLinePrice', () => {
        const expectedResult = {
            amount: 21.12,
            currencyCode: 'USD'
        }
        const mockRequest = new ShopPayPaymentRequest(basket)
        const mockLineItemsResponse = mockRequest.lineItems[0]
        assert.deepEqual(mockLineItemsResponse.originalLinePrice, expectedResult)
    })

    it('should return the lineDiscounts', () => {
        const expectedResult = [
            {
                label: '',
                amount: {
                    amount: 6.66,
                    currencyCode: 'USD'
                }
            }
        ]
        const mockRequest = new ShopPayPaymentRequest(basket)
        const mockLineItemsResponse = mockRequest.lineItems[0]
        assert.deepEqual(mockLineItemsResponse.lineDiscounts, expectedResult)
    })

    it('should return the originalItemPrice', () => {
        const expectedResult = {
            amount: 6.66,
            currencyCode: 'USD'
        }
        const mockRequest = new ShopPayPaymentRequest(basket)
        const mockLineItemsResponse = mockRequest.lineItems[0]
        assert.deepEqual(mockLineItemsResponse.originalItemPrice, expectedResult)
    })

    it('should return the finalItemPrice', () => {
        const expectedResult = {
            amount: 6.66,
            currencyCode: 'USD'
        }

        const mockRequest = new ShopPayPaymentRequest(basket)
        const mockLineItemsResponse = mockRequest.lineItems[0]
        assert.deepEqual(mockLineItemsResponse.finalItemPrice, expectedResult)
    })
})
