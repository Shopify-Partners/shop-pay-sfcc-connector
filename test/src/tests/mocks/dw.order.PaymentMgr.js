const PaymentMethod = require('../mocks/dw.order.PaymentMethod')
const PaymentCard = require('../mocks/dw.order.PaymentCard')
const Iterator = require('../mocks/util/Iterator')
const ArrayList = require('../mocks/util/Collection')

const PaymentMgr = function () {}

PaymentMgr.getApplicablePaymentMethods = function () {
    return new ArrayList([
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
    ])
}

PaymentMgr.getPaymentMethod = function (method) {
    return {
        paymentProcessor: {
            ID: method
        },
        isActive: () => {
            return true
        }
    }
}

PaymentMgr.paymentInstruments = [
    {
        ID: 'ShopPay',
        name: 'Shop Pay',
        paymentTransaction: {
            paymentProcessor: {
                ID: 'ShopPay'
            },
            amount: {
                value: 0
            }
        },
        custom: {
            shoppayPaymentToken: 'getYaTokensHere'
        }
    }
]

var paymentMethods = {
    testUser: [new PaymentMethod('TestPaymentMethod')]
}

PaymentMgr.getPaymentCard = function (cardType) { return new PaymentCard(cardType) };
PaymentMgr.getActivePaymentMethods = function () {}
PaymentMgr.prototype.paymentMethod = null
PaymentMgr.prototype.applicablePaymentMethods = null
PaymentMgr.prototype.paymentCard = null
PaymentMgr.prototype.activePaymentMethods = null

module.exports = PaymentMgr
