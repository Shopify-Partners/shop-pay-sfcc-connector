'use strict';

/**
 * @namespace ShopPay
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');
var shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/**
 * Kristin TODO: Build out helper scripts and call model to generate the response json elements dynamically
 * Kristin TODO: Controller JSdocs
 */
server.get('GetCartSummary', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var paymentRequestObj = {
        "shippingAddress": null,
        "discountCodes": [
            "LOYALTY15"
        ],
        "lineItems": [
            {
                "label": "T-Shirt",
                "quantity": 2,
                "sku": "M1234",
                "requiresShipping": true,
                "image": {
                    "url": "https://example.com/myshirtimage.jpg",
                    "alt": "Red T-Shirt"
                },
                "originalItemPrice": {
                    "amount": 10.00,
                    "currencyCode": "USD"
                },
                "itemDiscounts": [],
                "finalItemPrice": {
                    "amount": 10.00,
                    "currencyCode": "USD"
                },
                "originalLinePrice": {
                    "amount": 20.00,
                    "currencyCode": "USD"
                },
                "lineDiscounts": [],
                "finalLinePrice": {
                    "amount": 20.00,
                    "currencyCode": "USD"
                }
            }
        ],
        "shippingLines": [],
        "deliveryMethods": [],
        "locale": "en",
        "presentmentCurrency": "USD",
        "subtotal": {
            "amount": 20.00,
            "currencyCode": "USD"
        },
        "discounts": [
            {
                "label": "15% off",
                "amount": {
                    "amount": 3.00,
                    "currencyCode": "USD"
                }
            }
        ],
        "totalTax": {
            "amount": 1.06,
            "currencyCode": "USD"
        },
        "total": {
            "amount": 18.06,
            "currencyCode": "USD"
        }
    };

    res.json({
        error: false,
        errorMsg: null,
        paymentRequest: paymentRequestObj
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

    // Kristin TODO: Applicability checks
    var paymentRequestInput = req.httpParameterMap.paymentRequest;
    var paymentRequest = JSON.parse(paymentRequestInput);
    // Kristin TODO: replace this with error handling for the missing payment request input and/or basket
    if (!paymentRequestInput) {
        var serviceHelpers = require('*/cartridge/scripts/shoppay/helpers/serviceHelpers');
        paymentRequest = serviceHelpers.getMockPaymentRequest('createSession');
    }

    var storefrontAPI = require('*/cartridge/scripts/shoppay/storefrontAPI');
    var response = storefrontAPI.shopPayPaymentRequestSessionCreate(currentBasket, paymentRequest);
    // Kristin TODO: Error handling
    var paymentRequestSession = response.shopPayPaymentRequestSessionCreate.shopPayPaymentRequestSession;

    res.json({
        error: false,
        errorMsg: null,
        checkoutUrl: paymentRequestSession.checkoutUrl,
        sourceIdentifier: paymentRequestSession.sourceIdentifier,
        token: paymentRequestSession.token,
        paymentRequest: JSON.stringify(paymentRequest) /* Kristin TODO: remove this - used for testing only */
    });
    next();
});

module.exports = server.exports();
