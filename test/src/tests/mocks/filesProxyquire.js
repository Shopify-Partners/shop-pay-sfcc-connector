const path = require('path')
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru().noPreserveCache()

const Money = require('../mocks/dw.value.money')
const URLUtils = require('../mocks/dw.web.URLUtils')
const Site = require('../mocks/dw.system.Site')
const PaymentMgr = require('../mocks/dw.order.PaymentMgr')
const ShippingMgr = require('../mocks/dw.order.ShippingMgr')
const StringUtils = require('../mocks/dw.util.StringUtils')

const ArrayList = require('../mocks/util/Collection')
const Calendar = require('../mocks/util/Calendar')
const collections = require('../mocks/util/collections')

require('dw-api-mock/demandware-globals')
require('app-module-path').addPath(path.join(process.cwd(), '../cartridges'))

const mockCommon = proxyquire('int_shoppay/cartridge/scripts/shoppay/common.js', {
    '*/cartridge/scripts/util/collections': collections,
    '*/cartridge/scripts/util/array': require('../../../../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/scripts/util/array')
})

const mockDiscountHelpers = proxyquire('int_shoppay/cartridge/scripts/shoppay/helpers/discountHelpers.js', {
    '*/cartridge/scripts/util/collections': collections,
    '*/cartridge/scripts/shoppay/common': mockCommon
})

const mockDeliverDateHelpers = proxyquire('int_shoppay/cartridge/scripts/shoppay/helpers/deliveryDateHelpers.js', {
    'dw/util/Calendar': Calendar,
    'dw/util/StringUtils': StringUtils
})

const mockShippingHelpers = proxyquire('int_shoppay/cartridge/scripts/shoppay/helpers/shippingHelpers.js', {
    '*/cartridge/scripts/shoppay/helpers/eDeliveryHelpers': require('int_shoppay/cartridge/scripts/shoppay/helpers/eDeliveryHelpers.js'),
    '*/cartridge/scripts/shoppay/helpers/deliveryDateHelpers': mockDeliverDateHelpers,
    '*/cartridge/scripts/util/collections': collections,
    '*/cartridge/scripts/shoppay/common': mockCommon,
    'dw/order/ShippingMgr': ShippingMgr,
    'dw/util/ArrayList': ArrayList
})

const mockShoppayGlobalRefs = proxyquire('int_shoppay/cartridge/scripts/shoppayGlobalRefs.js', {
    'int_shoppay/cartridge/scripts/shoppayGlobalRefs.js': {
        shoppayPaymentMethodId: 'ShopPay'
    },
    'dw/web/URLUtils': URLUtils,
    'dw/system/Site': Site,
    '*/cartridge/scripts/shoppay/helpers/shippingHelpers': mockShippingHelpers,
    'dw/order/PaymentMgr': PaymentMgr,
})

const mockTotalsHelpers = proxyquire('int_shoppay/cartridge/scripts/shoppay/helpers/totalsHelpers.js', {
    '*/cartridge/scripts/shoppay/common': mockCommon,
    '*/cartridge/scripts/util/collections': collections,
})

const mockPaymentHelpers = proxyquire('int_shoppay/cartridge/scripts/shoppay/helpers/paymentHelpers.js', {
    '*/cartridge/scripts/shoppayGlobalRefs': mockShoppayGlobalRefs,
    'dw/order/PaymentMgr': PaymentMgr,
    'dw/system/Site': Site,
    'dw/util/Locale': {
        getLocale: () => {
            return {
                getLanguage: () => {
                    return 'US'
                },
                ID: 'en_US',
                country: 'US'
            }
        }
    }
})

module.exports = {
    mockCommon: mockCommon,
    mockDiscountHelpers: mockDiscountHelpers,
    mockDeliverDateHelpers: mockDeliverDateHelpers,
    mockShoppayGlobalRefs: mockShoppayGlobalRefs,
    mockShippingHelpers: mockShippingHelpers,
    mockTotalsHelpers: mockTotalsHelpers,
    mockPaymentHelpers: mockPaymentHelpers,
}
