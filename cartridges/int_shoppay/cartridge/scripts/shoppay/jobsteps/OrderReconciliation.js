'use strict'

/* Script Modules */
var adminAPI = require('*/cartridge/scripts/shoppay/adminAPI');
var postProcessingHelpers = require('*/cartridge/scripts/shoppay/helpers/postProcessingHelpers');

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');
var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');

/* Global Variables */
var orderCount;
var successCount;

/**
 * Finalizes processing of an SFCC order paid using Shop Pay. Finds the corresponding Shopify order,
 * updates select billing and customer attributes on the SFCC order from the Shopify order data,
 * and places the SFCC order.
 * @param {dw.order.Order} order - The SFCC order to finalize (Created -> New/Open)
 */
function processOrder(order) {
    orderCount++;
    var sourceIdentifier = order.custom.shoppaySourceIdentifier;
    var response = adminAPI.getOrderBySourceIdentifier(sourceIdentifier);
    if (response.error || response.orders.edges.length == 0) {
        Logger.error('[OrderReconciliation.js] Shopify order not found for SFCC order ' + order.orderNo);
        // This order will be reattempted on next run
        return;
    }

    var node = response.orders.edges[0].node;
    postProcessingHelpers.setOrderCustomAttributes(order, node);
    postProcessingHelpers.handleBillingInfo(order, node);
    var placeOrderResult = postProcessingHelpers.placeOrder(order);

    if (placeOrderResult.error) {
        Logger.error('[OrderReconciliation.js] Unable to place order ' + order.orderNo);
        // This order will be reattempted on next run
        return;
    }
    successCount++;
    return;
}

exports.Run = function(params, stepExecution) {
    try {
        var queryString;
        var orders;
        var result;
        orderCount = 0;
        successCount = 0;
        var maxOrderAgeHrs = params.MaxOrderAgeHrs; // optional input
        var minOrderAgeSecs = params.MinOrderAgeSecs; // required input
        var nowMillis = new Date().valueOf();
        var min = new Date(nowMillis - minOrderAgeSecs * 1000).toISOString(); // seconds to milliseconds
        if (maxOrderAgeHrs) {
            var max = new Date(nowMillis - maxOrderAgeHrs * 60 * 60 * 1000).toISOString(); // hours to milliseconds
            queryString = 'creationDate >= {0} AND creationDate <= {1} AND status = {2} AND custom.shoppayOrder = {3}';
            OrderMgr.processOrders(processOrder, queryString, max, min, Order.ORDER_STATUS_CREATED, true);
        } else {
            queryString = 'creationDate <= {0} AND status = {1} AND custom.shoppayOrder = {2}';
            OrderMgr.processOrders(processOrder, queryString, min, Order.ORDER_STATUS_CREATED, true);
        }
    } catch (e) {
        if (orders) {
            orders.close();
        }
        Logger.error('[OrderReconciliation.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return new Status(Status.ERROR, 'ERROR', 'Exception thrown: ' + e.message);
    }

    return new Status(Status.OK, 'OK', 'Successfully processed {0} / {1} orders', successCount, orderCount);
};
