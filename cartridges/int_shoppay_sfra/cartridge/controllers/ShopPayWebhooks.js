'use strict';

/**
 * @namespace ShopPayWebhooks
 */

var server = require('server');

/* Script Modules */
const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

/**
 * Calculate a Hmac digest and encode it in Base64 String
 *
 * @param   {string} data data to calculate hmac for
 * @param   {string} stringKey secret key for calculating digest
 * @returns {string} Base64 encoded string of data digest
 */
function calculateHmac(data, stringKey) {
    var Mac = require('dw/crypto/Mac');
    var Encoding = require('dw/crypto/Encoding');
    var Bytes = require('dw/util/Bytes');


    var macSha256 = new Mac(Mac.HMAC_SHA_256);
    var secretBytes = new Bytes(stringKey, 'UTF-8');
    var dataBytes = new Bytes(data, 'UTF-8');
    var calculatedHmac = macSha256.digest(dataBytes, secretBytes);
    var calculatedHmacBase64 = Encoding.toBase64(calculatedHmac);

    return calculatedHmacBase64;
}

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
        var Order = require('dw/order/Order');
        var OrderMgr = require('dw/order/OrderMgr');
        var Transaction = require('dw/system/Transaction');
        var postProcessingHelpers = require('*/cartridge/scripts/shoppay/helpers/postProcessingHelpers');
        var order;
        var placeOrderResult;
        var payload = JSON.parse(req.body);
        var HMACHeader = req.httpHeaders.get('x-shopify-hmac-sha256');
        var shoppayClientSecret = shoppayGlobalRefs.shoppayClientSecret;
        var calculatedHmacBase64 = shoppayClientSecret ? calculateHmac(req.body, shoppayClientSecret) : '';

        if (!HMACHeader || !calculatedHmacBase64 || HMACHeader !== calculatedHmacBase64) {
            Logger.error('[ShopPayWebhooks-OrdersCreate] HMAC header validation failed');
            res.json({});
            return next();
        }

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
            Logger.error('[ShopPayWebhooks-OrdersCreate] Order not found for source_identifier ' + payload.source_identifier);
            res.json({});
            return next();
        }

        // Webhooks can sometimes be received more than once. Ensure payload has not already been handled.
        if (order.status.value === Order.ORDER_STATUS_CREATED) {
            Transaction.wrap(function() {
                postProcessingHelpers.setOrderCustomAttributes(order, payload);
                postProcessingHelpers.handleBillingInfo(order, payload);
                order.custom.shoppayOrderCreateWebhookReceived = true;
                placeOrderResult = postProcessingHelpers.placeOrder(order);
            });
            if (placeOrderResult.error) {
                Logger.error('[ShopPayWebhooks-OrdersCreate] Unable to place order ' + order.orderNo);
                // This order will be reattempted by the Order Reconciliation job
                res.json({});
                return next();
            }
        }
    } catch (e) {
        Logger.error('[ShopPayWebhooks-OrdersCreate] error: \n\r' + e.message + '\n\r' + e.stack);
    }
    res.json({
        success: true
    });
    next();
});

module.exports = server.exports();
