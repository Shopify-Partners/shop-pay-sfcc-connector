'use strict';

/**
 * @namespace ShopPayWebhooks
 */

var server = require('server');

var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

/**
 * The ShopPayWebhooks-OrdersCreate controller receives the payload of the Shopify ORDERS_CREATE
 * webhook for an order paid with Shop Pay and finalizes the SFCC order.
 * @name Base/ShopPayWebhooks-BeginSession
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('OrdersCreate', server.middleware.https, function (req, res, next) {
    // Kristin TODO: Build out this controller in SSPSC-31
    try {
        logger.debug(req.body);
    } catch (e) {
        logger.error('[Webhooks-OrdersCreate] error: \n\r' + e.message + '\n\r' + e.stack);
    }
    res.json({
        success: true
    });
    next();
});

module.exports = server.exports();
