'use strict';

/**
 * @namespace ShopPayWebhooks
 */

var server = require('server');

var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

/**
 * The ShopPayWebhooks-OrdersCreate controller receives the payload of the Shopify ORDERS_CREATE
 * webhook for an order paid with Shop Pay and finalizes the SFCC order.
 * @name Base/ShopPayWebhooks-OrdersCreate
 * @function
 * @memberOf ShopPay
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {renders} - json
 * @param {serverfunction} - post
 */
server.post('OrdersCreate', server.middleware.https, function (req, res, next) {
    try {
        var OrderMgr = require('dw/order/OrderMgr');
        var Transaction = require('dw/system/Transaction');
        var postProcessingHelpers = require('*/cartridge/scripts/shoppay/helpers/postProcessingHelpers');
        var order;
        var placeOrderResult
        var payload = JSON.parse(req.body);
        if (payload.source_identifier) {
            order = OrderMgr.queryOrder('custom.shoppaySourceIdentifier={0}', payload.source_identifier);
        }
        if (!order) {
            /* If multiple SFCC environments are using the same Shopify store, the ORDERS_CREATE webhook will
               send a payload to all subscribers. Therefore, this controller may get called, at times, for
               an order that was not created on the same environment and therefore the order cannot be located.
               On dev/test environments this is likely not indicative of a true error as it likely would be on a
               production environment.
            */
            logger.error('[ShopPayWebhooks-OrdersCreate] order not found for source_identifier {0}.', payload.source_identifier);
            res.json({});
            return next();
        }
        Transaction.wrap(function() {
            postProcessingHelpers.setOrderCustomAttributes(order, payload);
            postProcessingHelpers.handleBillingInfo(order, payload);
            order.custom.shoppayOrderCreateWebhookReceived = true;
            placeOrderResult = postProcessingHelpers.placeOrder(order);
        });
        if (placeOrderResult.error) {
            logger.error('Unable to place order {0}.', order.orderNo);
            // This order will be reattempted by the Order Reconciliation job
            res.json({});
            return next();
        }
    } catch (e) {
        logger.error('[ShopPayWebhooks-OrdersCreate] error: \n\r' + e.message + '\n\r' + e.stack);
    }
    res.json({
        success: true
    });
    next();
});

module.exports = server.exports();
