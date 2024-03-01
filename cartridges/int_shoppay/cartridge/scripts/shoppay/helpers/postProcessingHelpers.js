'use strict'

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');
var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');

/* ORDERS_CREATE payload uses underscores (snake case) while GraphQL response uses camel case. This
   object maps the attributes for both payload types to the appropriate SFCC billing address attribute. */
const addressElements = {
    "companyName": "companyName",
    "company": "companyName",
    "firstName": "firstName",
    "first_name": "firstName",
    "lastName": "lastName",
    "last_name": "lastName",
    "address1": "address1",
    "address2": "address2",
    "city": "city",
    "zip": "postalCode",
    "provinceCode": "stateCode",
    "province_code": "stateCode",
    "countryCodeV2": "countryCode",
    "country_code": "countryCode",
    "phone": "phone"
};

/**
 * Updates the billing address, customer name, and email on an SFCC order (paid with Shop Pay)
 * from an associated Shopify order. This data is not available at the time of order creation during checkout.
 * @param {dw.order.Order} order - The target SFCC order
 * @param {Object} node - The Shopify order payload
 */
var handleBillingInfo = function(order, node) {
    var billingAddress = order.billingAddress;
    // ORDERS_CREATE payload uses underscores (snake case) while GraphQL response uses camel case
    var nodeBillingAddress = node.billingAddress ? node.billingAddress : node.billing_address;
    if (node.email) {
        order.customerEmail = node.email;
    }
    var addressKeys = Object.keys(addressElements);
    for (var i = 0; i < addressKeys.length; i++) {
        var shoppayAttribute = addressKeys[i];
        var sfccAttribute = addressElements[shoppayAttribute];
        if (!empty(nodeBillingAddress[shoppayAttribute])) {
            billingAddress[sfccAttribute] = nodeBillingAddress[shoppayAttribute];
        }
    }
    // billing phone is optional in the Shopify Shop App
    if (empty(nodeBillingAddress.phone) && node.customer && !empty(node.customer.phone)) {
        billingAddress.phone = node.customer.phone;
    }
    if (node.customer) {
        // ORDERS_CREATE payload uses underscores (snake case) while GraphQL response uses camel case
        var firstName = node.customer.firstName ? node.customer.firstName : node.customer.first_name;
        var lastName = node.customer.lastName ? node.customer.lastName : node.customer.last_name;
        if ((!empty(firstName) || !empty(lastName))) {
            var customerName = !empty(firstName) ? firstName : "";
            customerName += !empty(lastName) ? (customerName.length > 0 ? ' ' + lastName : lastName) : "";
            if (customerName.length > 0) {
                order.customerName = customerName;
            }
        }
    }
};

/**
 * Captures references to an associated Shopify order on an SFCC order paid with Shop Pay.
 * This data is not available at the time of order creation during checkout.
 * @param {dw.order.Order} order - The target SFCC order
 * @param {Object} node - The Shopify order payload
 */
var setOrderCustomAttributes = function(order, node) {
    order.custom.shoppayOrderNumber = node.name;
    if (node.admin_graphql_api_id) { // ORDERS_CREATE webhook payload attribute
        order.custom.shoppayGraphQLOrderId = node.admin_graphql_api_id;
    } else if (node.id) { // GraphQL Orders response payload attribute
        order.custom.shoppayGraphQLOrderId = node.id;
    }
};

/**
 * Attempts to place an SFCC order that was paid with Shop Pay.
 * @param {dw.order.Order} order - The target SFCC order
 * @returns {Object} an error object
 */
var placeOrder = function(order) {
    var result = { error: false };

    try {
        var placeOrderStatus = OrderMgr.placeOrder(order);
        if (placeOrderStatus.status === Status.ERROR) {
            throw new Error(placeOrderStatus.message);
        }

        order.setConfirmationStatus(Order.CONFIRMATION_STATUS_CONFIRMED);

        order.setExportStatus(Order.EXPORT_STATUS_READY);
    } catch (e) {
        result.error = true;
        Logger.error('[postProcessingHelpers.js] error: \n\r' + e.message + '\n\r' + (e.stack ? e.stack : ''));
    }

    return result;
};

module.exports = {
    handleBillingInfo: handleBillingInfo,
    placeOrder: placeOrder,
    setOrderCustomAttributes: setOrderCustomAttributes
}
