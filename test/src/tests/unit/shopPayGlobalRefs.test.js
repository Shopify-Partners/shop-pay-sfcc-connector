const { assert } = require('chai')
const path = require('path')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

const collections = require('../mocks/util/collections')
const BasketMgr = require('../mocks/dw.order.BasketMgr')
const ProductMgr = require('../mocks/dw.catalog.ProductMgr')
const Customer = require('../mocks/dw.customer.Customer')
const ArrayList = require('../mocks/util/Collection')
const StringUtils = require('../mocks/dw.util.StringUtils')
const Site = require('../mocks/dw.system.Site')
const URLUtils = require('../mocks/dw.web.URLUtils')
const PaymentMgr = require('../mocks/dw.order.PaymentMgr')

const { mockShippingHelpers } = require('../mocks/filesProxyquire')

const basket = BasketMgr.getCurrentBasket()
const customer = new Customer()

require('dw-api-mock/demandware-globals')
require('app-module-path').addPath(path.join(process.cwd(), '../cartridges'))

const mockPaymentMethods = [
    {
        ID: 'CREDIT_CARD',
        name: 'Credit Card',
        UUID: 'asdf'
    },
    {
        ID: 'ShopPay',
        name: 'Shop Pay',
        UUID: 'qwerty'
    }
]

const mockShoppayGlobalRefs = proxyquire('int_shoppay/cartridge/scripts/shoppayGlobalRefs.js', {
    'int_shoppay/cartridge/scripts/shoppayGlobalRefs.js': {
        shoppayPaymentMethodId: 'ShopPay'
    },
    'dw/web/URLUtils': URLUtils,
    'dw/system/Site': Site,
    '*/cartridge/scripts/shoppay/helpers/shippingHelpers': mockShippingHelpers,
    'dw/order/PaymentMgr': {
        getPaymentMethod: () => {
            return {
                paymentProcessor: {
                    ID: 'ShopPay'
                },
                isActive: () => {
                    return true
                },
                contains: () => {
                    return true
                }
            }
        },
        getApplicablePaymentMethods: () => {
            return {
                contains: () => {
                    return true
                }
            }
        },
    }
})

describe('int_shoppay/cartridge/scripts/shoppayGlobalRefs.js', () => {

    it('should verify the core reference for whether to include the Shop Pay script tag on a PDP', () => {
        const productId = basket.productLineItems[0].product.ID
        const mockGlobalRefs = mockShoppayGlobalRefs
        const result = mockGlobalRefs.shoppayElementsApplicable('pdp', productId)
        assert.strictEqual(result, true)
    })

    it('should verify the core reference for whether to include the Shop Pay script tag the Cart page', () => {
        const productId = basket.productLineItems[0].product.ID
        const mockGlobalRefs = mockShoppayGlobalRefs
        const result = mockGlobalRefs.shoppayElementsApplicable('cart', productId)
        assert.strictEqual(result, true)
    })

    it('should verify the core reference for whether to include the Shop Pay script tag in Checkout', () => {
        const productId = basket.productLineItems[0].product.ID
        const mockGlobalRefs = mockShoppayGlobalRefs
        const result = mockGlobalRefs.shoppayElementsApplicable('checkout', productId)
        assert.strictEqual(result, true)
    })

    it('should return true if the ShopPay payment method is valid => shoppayApplicable', () => {
        const mockRequest = {
            req: {
                geolocation: {
                    countryCode: 'US'
                },
                currentCustomer: {
                    raw: customer
                }
            }
        }
        const mockGlobalRefs = mockShoppayGlobalRefs
        const result = mockGlobalRefs.shoppayApplicable(mockRequest.req, basket)
        assert.strictEqual(result, true)
    })

    it('should return false if the ShopPay payment method is not valid => shoppayApplicable', () => {
        const mockGlobalRefs = proxyquire('int_shoppay/cartridge/scripts/shoppayGlobalRefs.js', {
            'int_shoppay/cartridge/scripts/shoppayGlobalRefs.js': {
                shoppayPaymentMethodId: 'ShopPay'
            },
            'dw/web/URLUtils': URLUtils,
            'dw/system/Site': Site,
            '*/cartridge/scripts/shoppay/helpers/shippingHelpers': mockShippingHelpers,
            'dw/order/PaymentMgr': {
                getPaymentMethod: () => {
                    return {
                        paymentProcessor: {
                            ID: 'CREDIT_CARD'
                        },
                        isActive: () => {
                            return true
                        },
                        contains: () => {
                            return false
                        }
                    }
                },
                getApplicablePaymentMethods: () => {
                    return {
                        contains: () => {
                            return false
                        }
                    }
                },
            }
        })

        const mockRequest = {
            req: {
                geolocation: {
                    countryCode: 'US'
                },
                currentCustomer: {
                    raw: customer
                }
            }
        }

        const result = mockGlobalRefs.shoppayApplicable(mockRequest.req, basket)
        assert.strictEqual(result, false)
    })

    it('should verify an object is available to client-side JS', () => {
        const expectedResult = {
            urls: {
              GetCartSummary: 'https://zzys-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/default/ShopPay-GetCartSummary',
              BeginSession: 'https://zzys-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/default/ShopPay-BeginSession',
              BuyNowData: 'https://zzys-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/default/ShopPay-BuyNowData',
              DiscountCodeChanged: 'https://zzys-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/default/ShopPay-DiscountCodeChanged',
              DeliveryMethodChanged: 'https://zzys-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/default/ShopPay-DeliveryMethodChanged',
              PrepareBasket: 'https://zzys-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/default/ShopPay-PrepareBasket',
              SubmitPayment: 'https://zzys-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/default/ShopPay-SubmitPayment',
              ShippingAddressChanged: 'https://zzys-001.dx.commercecloud.salesforce.com/on/demandware.store/Sites-RefArch-Site/default/ShopPay-ShippingAddressChanged'
            },
            constants: { shoppayEnabled: true, initShopPayEmailRecognition: false, isBuyNow: false },
            preferences: {
              shoppayPDPButtonEnabled: true,
              shoppayCartButtonEnabled: true,
              shoppayStoreId: 'qwerty',
              shoppayClientId: '999',
              shoppayModalDebugEnabled: false
            }
        }
        const productId = basket.productLineItems[0].product.ID
        const mockGlobalRefs = mockShoppayGlobalRefs
        assert.deepEqual(mockGlobalRefs.getClientRefs(false, productId), expectedResult)
    })
})
