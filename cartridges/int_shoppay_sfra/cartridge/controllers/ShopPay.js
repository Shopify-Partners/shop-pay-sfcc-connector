'use strict';

/**
 * @namespace ShopPay
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Resource = require('dw/web/Resource');
var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');
var shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/**
 * The ShopPay-GetCartSummary controller generates the payment request object for use with Shop Pay checkout and
 * payments
 * @name Base/ShopPay-GetCartSummary
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - get
 */
server.get('GetCartSummary', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var PaymentRequestModel = require('*/cartridge/models/paymentRequest');

    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket
        || (currentBasket.productLineItems.length == 0 && currentBasket.giftCertificateLineItems.length == 0)
    ) {
        res.json({
            error: true,
            errorMsg: Resource.msg('info.cart.empty.msg', 'cart', null),
            paymentRequest: null
        });
        return next();
    }

    var shoppayEligible = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);;
    if (!shoppayEligible) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.cart.ineligible', 'shoppay', null),
            paymentRequest: null
        });
        return next();
    }

    try {
        var paymentRequestModel = new PaymentRequestModel(currentBasket);
    } catch (e) {
        logger.error('[ShopPay-GetCartSummary] error: \n\r' + e.message + '\n\r' + e.stack);
        res.json({
            error: true,
            errorMsg: e.message,
            paymentRequest: paymentRequestModel
        });
        return next();
    }

    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: paymentRequestModel
    });
    next();
});

/**
 * The ShopPay-BeginSession controller initializes the Shop Pay payment request session with the
 * Shop Pay GraphQL API and returns the data needed to verify the Shop Pay session client-side.
 * @name Base/ShopPay-BeginSession
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('BeginSession', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket
        || (currentBasket.productLineItems.length == 0 && currentBasket.giftCertificateLineItems.length == 0)
    ) {
        res.json({
            error: true,
            errorMsg: Resource.msg('info.cart.empty.msg', 'cart', null)
        });
        return next();
    }

    var shoppayEligible = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);;
    if (!shoppayEligible) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.cart.ineligible', 'shoppay', null)
        });
        return next();
    }

    var paymentRequestInput = req.httpParameterMap['paymentRequest'];
    var paymentRequest = paymentRequestInput.empty? null : JSON.parse(paymentRequestInput.value);
    if (!paymentRequest) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.input.error.missing', 'shoppay', null),
        });
        return next();
    }

    var storefrontAPI = require('*/cartridge/scripts/shoppay/storefrontAPI');
    var response = storefrontAPI.shopPayPaymentRequestSessionCreate(currentBasket, paymentRequest);
    if (!response
        || response.error
        || !response.shopPayPaymentRequestSessionCreate
        || response.shopPayPaymentRequestSessionCreate.userErrors.length > 0
    ) {
        res.json({
            error: true,
            errorMsg: Resource.msg('shoppay.service.error', 'shoppay', null),
        });
        return next();
    }
    var paymentRequestSession = response.shopPayPaymentRequestSessionCreate.shopPayPaymentRequestSession;

    res.json({
        error: false,
        errorMsg: null,
        checkoutUrl: paymentRequestSession.checkoutUrl,
        sourceIdentifier: paymentRequestSession.sourceIdentifier,
        token: paymentRequestSession.token
    });
    next();
});

module.exports = server.exports();
