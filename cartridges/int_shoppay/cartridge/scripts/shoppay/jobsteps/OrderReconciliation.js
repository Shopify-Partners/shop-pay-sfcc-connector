'use strict'

var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');

var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

var orders;

var beforeStep = function(parameters, stepExecution) {
    try {
        var queryString;
        var maxOrderAgeHrs = parameters.get('MaxOrderAgeHrs'); // optional input
        var minOrderAgeSecs = parameters.get('MinOrderAgeSecs'); // required input
        var nowMillis = new Date().valueOf();
        var min = new Date(nowMillis - minOrderAgeSecs * 1000).toISOString(); // seconds to milliseconds
        if (maxOrderAgeHrs) {
            var max = new Date(nowMillis - maxOrderAgeHrs * 60 * 60 * 1000).toISOString(); // hours to milliseconds
            queryString = 'creationDate >= {0} AND creationDate <= {1} AND custom.shoppayOrder = {2} AND status = {3}';
            orders = OrderMgr.searchOrders(queryString, null, max, min, true, Order.ORDER_STATUS_CREATED);
        } else {
            queryString = 'creationDate <= {0} AND custom.shoppayOrder = {1} AND status = {2}';
            orders = OrderMgr.searchOrders(queryString, null, min, true, Order.ORDER_STATUS_CREATED);
        }
    } catch (e) {
        logger.error('[ReconcileOrder.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return new Status(Status.ERROR);
    }
    return new Status(Status.OK);
};

var getTotalCount = function(parameters, stepExecution) {
    return orders.count;
};

var readOrder = function(parameters, stepExecution) {
    if (orders.hasNext()) {
        return orders.next();
    }
};

var process = function(order, parameters, stepExecution) {
    logger.debug('processing order ' + order.orderNo);
    return new Status(Status.OK);
};

var writeOrder = function(parameters, stepExecution) {
    // do nothing, return nothing
};

var afterStep = function(success, parameters, stepExecution) {
    orders.close();
};

module.exports = {
    BeforeStep: beforeStep,
    GetTotalCount: getTotalCount,
    ReadOrder: readOrder,
    Process: process,
    WriteOrder: writeOrder,
    AfterStep: afterStep
};
