'use strict';

/**
 * @namespace ShopPay
 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

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
