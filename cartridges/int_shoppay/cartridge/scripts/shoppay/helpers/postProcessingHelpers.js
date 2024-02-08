'use strict'

var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');

const addressElements = {
    companyName: "companyName",
    firstName: "firstName",
    lastName: "lastName",
    address1: "address1",
    address2: "address2",
    city: "city",
    postalCode: "zip",
    stateCode: "provinceCode",
    countryCode: "countryCodeV2",
    phone: "phone"
};

/**
 *
 * @param {dw.order.Order} order
 * @param {Object} billingAddress
 * @param {string} customerEmail
 */
var handleBillingInfo = function(order, node) {
    var billingAddress = order.billingAddress;
    if (node.email) {
        order.customerEmail = node.email;
    }
    var addressKeys = Object.keys(addressElements);
    for (var i = 0; i < addressKeys.length; i++) {
        var key = addressKeys[i];
        var value = addressElements[key];
        if (!empty(node.billingAddress[value])) {
            billingAddress[key] = node.billingAddress[value];
        }
    }
    if (node.customer && (!empty(node.customer.firstName) || !empty(node.customer.lastName))) {
        var customerName = node.customer.firstName ? node.customer.firstName : "";
        customerName += node.customer.lastName
            ? (customerName.length > 0 ? ' ' + node.customer.lastName : node.customer.lastName)
            : "";
        if (customerName.length > 0) {
            order.customerName = customerName;
        }
    }
};

/**
 *
 * @param {dw.order.Order} order
 * @param {Object} node
 */
var setOrderCustomAttributes = function(order, node) {
    order.custom.shoppayOrderNumber = node.name;
    order.custom.shoppayGraphQLOrderId = node.id;
};

/**
 * Attempts to place the order
 * @param {dw.order.Order} order - The order object to be placed
 * @returns {Object} an error object
 */
var placeOrder = function(order) {
    var result = { error: false };

    try {
        var placeOrderStatus = OrderMgr.placeOrder(order);
        if (placeOrderStatus === Status.ERROR) {
            throw new Error();
        }

        order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);

        order.setExportStatus(Order.EXPORT_STATUS_READY);
    } catch (e) {
        // Kristin TODO: Fail order? Or retry on another job pass? Need to cancel in Shopify if failed?
        OrderMgr.failOrder(order, false);
        result.error = true;
    }

    return result;
};

module.exports = {
    handleBillingInfo: handleBillingInfo,
    setOrderCustomAttributes: setOrderCustomAttributes,
    placeOrder: placeOrder
}
