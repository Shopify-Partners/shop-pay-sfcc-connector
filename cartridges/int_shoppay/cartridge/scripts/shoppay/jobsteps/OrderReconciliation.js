'use strict'

var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');

var adminAPI = require('*/cartridge/scripts/shoppay/adminAPI');
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
            queryString = 'creationDate >= {0} AND creationDate <= {1} AND status = {2} AND custom.shoppayOrder = {3} AND custom.shoppayOrderCreateWebhookReceived != {4}';
            orders = OrderMgr.searchOrders(queryString, null, max, min, Order.ORDER_STATUS_CREATED, true, true);
        } else {
            queryString = 'creationDate <= {0} AND status = {1} AND custom.shoppayOrder = {2} AND custom.shoppayOrderCreateWebhookReceived != {3}';
            orders = OrderMgr.searchOrders(queryString, null, min, Order.ORDER_STATUS_CREATED, true,  true);
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
    var sourceIdentifier = order.custom.shoppaySourceIdentifier;
    var response = adminAPI.getOrderBySourceIdentifier(sourceIdentifier);
    if (response.error || response.orders.edges.length == 0) {
        return new Status(Status.ERROR);
    }
    order.custom.shoppayOrderNumber = node.name;
    order.custom.shoppayGraphQLOrderId = node.id;
    var node = response.orders.edges[0].node;
    var billingAddress = order.billingAddress;
    if (node.email) {
        order.customerEmail = node.email;
    }
    billingAddress.firstName = node.billingAddress.firstName;
    billingAddress.lastName = node.billingAddress.lastName;
    billingAddress.address1 = node.billingAddress.address1;
    if (node.billingAddress.address2 != null && node.billingAddress.address2 != "") {
        billingAddress.address2 = node.billingAddress.address2;
    }
    billingAddress.city = node.billingAddress.city;
    billingAddress.postalCode = node.billingAddress.zip;
    billingAddress.stateCode = node.billingAddress.provinceCode;
    billingAddress.countryCode = node.billingAddress.countryCodeV2;
    billingAddress.phone = node.billingAddress.phone;

    OrderMgr.placeOrder(order);

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
