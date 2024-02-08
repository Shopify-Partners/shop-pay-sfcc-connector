'use strict'

var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');

var adminAPI = require('*/cartridge/scripts/shoppay/adminAPI');
var logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');

var orderCount;
var successCount;

function callbackFunction(order) {
    orderCount++;
    var sourceIdentifier = order.custom.shoppaySourceIdentifier;
    var response = adminAPI.getOrderBySourceIdentifier(sourceIdentifier);
    if (response.error || response.orders.edges.length == 0) {
        return new Status(Status.ERROR);
    }

    var node = response.orders.edges[0].node;
    var billingAddress = order.billingAddress;

    order.custom.shoppayOrderNumber = node.name;
    order.custom.shoppayGraphQLOrderId = node.id;

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
    successCount++;
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
        // Kristin TODO: replace collections reference as it is in SFRA core and not in BM cartridge path
        while (orders.hasNext()) {
            callbackFunction(orders.next());
        }
        logger.debug("Processed: {0} orders / Found: {1} orders", successCount, orderCount);
    } catch (e) {
        if (orders) {
            orders.close();
        }
        var test = e;
        logger.error('[OrderReconciliation.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return new Status(Status.ERROR);
    }

    return new Status(Status.OK);
};
