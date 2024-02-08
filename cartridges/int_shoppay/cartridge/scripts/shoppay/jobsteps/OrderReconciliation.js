'use strict'

var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');

var adminAPI = require('*/cartridge/scripts/shoppay/adminAPI');
var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');
var postProcessingHelpers = require('*/cartridge/scripts/shoppay/helpers/postProcessingHelpers');

var orderCount;
var successCount;

function processOrder(order) {
    orderCount++;
    var sourceIdentifier = order.custom.shoppaySourceIdentifier;
    var response = adminAPI.getOrderBySourceIdentifier(sourceIdentifier);
    if (response.error || response.orders.edges.length == 0) {
        // Allow job to continue and re-attempt this order on next run
        return new Status(Status.OK);
    }

    var node = response.orders.edges[0].node;
    postProcessingHelpers.setOrderCustomAttributes(order, node);
    postProcessingHelpers.handleBillingInfo(order, node);
    var placeOrderResult = postProcessingHelpers.placeOrder(order);
    if (placeOrderResult.error) {
        logger.error('Unable to place order ' + order.orderNo);
        // Kristin TODO: Send status update to cancel order in Shopify?
        return new Status(Status.ERROR, null, 'Unable to place order ' + order.orderNo);
    }
    successCount++;
    return new Status(Status.OK);
}

exports.Run = function(params, stepExecution) {
    try {
        var queryString;
        var orders;
        var maxOrderAgeHrs = params.MaxOrderAgeHrs; // optional input
        var minOrderAgeSecs = params.MinOrderAgeSecs; // required input
        var nowMillis = new Date().valueOf();
        var min = new Date(nowMillis - minOrderAgeSecs * 1000).toISOString(); // seconds to milliseconds
        if (maxOrderAgeHrs) {
            var max = new Date(nowMillis - maxOrderAgeHrs * 60 * 60 * 1000).toISOString(); // hours to milliseconds
            queryString = 'creationDate >= {0} AND creationDate <= {1} AND status = {2} AND custom.shoppayOrder = {3} AND custom.shoppayOrderCreateWebhookReceived != {4}';
            orders = OrderMgr.searchOrders(queryString, null, max, min, Order.ORDER_STATUS_CREATED, true, true);
        } else {
            queryString = 'creationDate <= {0} AND status = {1} AND custom.shoppayOrder = {2} AND custom.shoppayOrderCreateWebhookReceived != {3}';
            orders = OrderMgr.searchOrders(queryString, null, min, Order.ORDER_STATUS_CREATED, true,  true);
        }
        orderCount = 0;
        successCount = 0;
        var result;
        while (orders.hasNext()) {
            result = processOrder(orders.next());
            if (result.isError()) {
                return result;
            }
        }
        logger.debug('Processed: {0} orders / Found: {1} orders', successCount, orderCount);
    } catch (e) {
        if (orders) {
            orders.close();
        }
        logger.error('[OrderReconciliation.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return new Status(Status.ERROR, null, 'Exception thrown.');
    }

    return new Status(Status.OK, null, 'Successfully processed {0} / {1} orders', successCount, orderCount);
};
