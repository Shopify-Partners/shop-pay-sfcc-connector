'use strict';

/**
 * @namespace ShopPay
 */

var server = require('server');

var BasketMgr = require('dw/order/BasketMgr');
var HookMgr = require('dw/system/HookMgr');
var Locale = require('dw/util/Locale');
var OrderMgr = require('dw/order/OrderMgr');
var PaymentMgr = require('dw/order/PaymentMgr');
var Transaction = require('dw/system/Transaction');

server.get('BuyNow', server.middleware.https, function (req, res, next) {
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var CartModel = require('*/cartridge/models/cart');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    try {
        var isBuyNow = req.httpParameterMap['buynow'] && req.httpParameterMap['buynow'].value == "true";
        var currentBasket = BasketMgr.getCurrentBasket();
        var orderModel = null;

        if (isBuyNow) {
            function createBuyNowBasket() {
                // Delete any existing open temporary baskets
                BasketMgr.getTemporaryBaskets().toArray().forEach(function (basket) {
                    BasketMgr.deleteTemporaryBasket(basket);
                });

                // Create a new temporary basket
                return BasketMgr.createTemporaryBasket();
            }
            Transaction.wrap(function () {
                var tempBasket = createBuyNowBasket();
                var tempBasketResult = cartHelper.addProductToCart(
                    tempBasket,
                    '701643472710M',
                    1,
                    [],
                    []
                );
                if (!tempBasketResult.error) {
                    cartHelper.ensureAllShipmentsHaveMethods(tempBasket);

                    var shipment = tempBasket.defaultShipment;
                    if (!shipment.shippingAddress) {
                        shipment.createShippingAddress();
                    }
                    var address = shipment.shippingAddress;
                    address.firstName = 'Jane';
                    address.lastName = 'Doe';
                    address.address1 = '500 W Madison St';
                    address.city = 'Chicago';
                    address.stateCode = 'IL';
                    address.postalCode = '60661';
                    address.countryCode = 'US';

                    tempBasket.customerEmail = 'kristin@themazegroup.com';

                    if (!tempBasket.billingAddress) {
                        tempBasket.createBillingAddress();
                    }
                    var billingAddress = tempBasket.billingAddress;
                    billingAddress.firstName = 'Jane';
                    billingAddress.lastName = 'Doe';
                    billingAddress.address1 = '500 W Madison St';
                    billingAddress.city = 'Chicago';
                    billingAddress.stateCode = 'IL';
                    billingAddress.postalCode = '60661';
                    billingAddress.countryCode = 'US';

                    basketCalculationHelpers.calculateTotals(tempBasket);
                    var paymentInformation = {
                        cardNumber: {
                            value: '4111111111111111'
                        },
                        securityCode: {
                            value: '123'
                        },
                        expirationMonth: {
                            value: 3
                        },
                        expirationYear: {
                            value: 2030
                        },
                        cardType: {
                            value: 'Visa'
                        }
                    };
                    var paymentMethodID = 'CREDIT_CARD';
                    if (HookMgr.hasHook('app.payment.processor.basic_credit')) {
                        var handleResult = HookMgr.callHook('app.payment.processor.basic_credit',
                            'Handle',
                            tempBasket,
                            paymentInformation,
                            paymentMethodID,
                            req
                        );
                    }

                    //cartModel = new CartModel(tempBasket);
                    var order = OrderMgr.createOrder(tempBasket);
                    var paymentInstrument = order.paymentInstruments[0];
                    var paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.paymentMethod).paymentProcessor;
                    if (HookMgr.hasHook('app.payment.processor.basic_credit')) {
                        var authorizationResult = HookMgr.callHook(
                            'app.payment.processor.basic_credit',
                            'Authorize',
                            order.orderNo,
                            paymentInstrument,
                            paymentProcessor
                        );
                    };
                    var fraudDetectionStatus = {
                        status: 'success',
                        errorCode: null,
                        errorMessage: null
                    };
                    var placeOrderResult = COHelpers.placeOrder(order, fraudDetectionStatus);
                    var OrderModel = require('*/cartridge/models/order');

                    var config = {
                        numberOfLineItems: '*'
                    };
                    var currentLocale = Locale.getLocale(req.locale.id);
                    orderModel = new OrderModel(
                        order,
                        { config: config, countryCode: currentLocale.country, containerView: 'order' }
                    );
                }
            });
        }
    } catch (e) {
        res.json({
            success: false,
            errorMsg: e.message
        });
        return next();
    }
    res.json({
        success: true,
        errorMsg: null,
        orderModel: orderModel
    });
    next();
});

module.exports = server.exports();
