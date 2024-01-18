'use strict';

/**
 * @namespace ShopPay
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
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
    var Resource = require('dw/web/Resource');

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
            error: false,
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
 * Kristin TODO: Build out helper scripts to send paymentRequest to ShopPay via GraphQL
 * Kristin TODO: Dynamically assign the response json elements from the GraphQL response
 * Kristin TODO: Controller JSdocs
 */
server.post('BeginSession', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentOrNewBasket();

    var checkoutUrl = URLUtils.https('Checkout-Begin').toString();
    var sourceIdentifier = currentBasket.UUID;
    var shoppayToken = "db4eede13822684b13a607823b7ba40d";

    res.json({
        error: false,
        errorMsg: null,
        checkoutUrl: checkoutUrl,
        sourceIdentifier: sourceIdentifier,
        token: shoppayToken
    });
    next();
});

module.exports = server.exports();
