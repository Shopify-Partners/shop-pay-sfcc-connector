'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var Locale = require('dw/util/Locale');

var OrderModel = require('*/cartridge/models/order');

/**
* Returns a list of orders for the current customer
* @param {Object} currentCustomer - object with customer properties
* @param {Object} querystring - querystring properties
* @param {string} locale - the current request's locale id
* @returns {Object} - orderModel of the current dw order object
* */
function getOrders(currentCustomer, querystring, locale) {
    // get all orders for this user
    var orderHistory = currentCustomer.raw.getOrderHistory();
    var customerOrders = orderHistory.getOrders(
        'status!={0}',
        'creationDate desc',
        Order.ORDER_STATUS_REPLACED
    );

    var orders = [];

    var filterValues = [
        {
            displayValue: Resource.msg('orderhistory.sixmonths.option', 'order', null),
            optionValue: URLUtils.url('Order-Filtered', 'orderFilter', '6').abs().toString()
        },
        {
            displayValue: Resource.msg('orderhistory.twelvemonths.option', 'order', null),
            optionValue: URLUtils.url('Order-Filtered', 'orderFilter', '12').abs().toString()
        }
    ];
    var orderYear;
    var years = [];
    var customerOrder;
    var SIX_MONTHS_AGO = Date.now() - 15778476000;
    var YEAR_AGO = Date.now() - 31556952000;
    var orderModel;

    var currentLocale = Locale.getLocale(locale);

    while (customerOrders.hasNext()) {
        customerOrder = customerOrders.next();
        var config = {
            numberOfLineItems: 'single'
        };

        orderYear = customerOrder.getCreationDate().getFullYear().toString();
        var orderTime = customerOrder.getCreationDate().getTime();

        if (years.indexOf(orderYear) === -1) {
            var optionURL =
                URLUtils.url('Order-Filtered', 'orderFilter', orderYear).abs().toString();
            filterValues.push({
                displayValue: orderYear,
                optionValue: optionURL
            });
            years.push(orderYear);
        }

        if (querystring.orderFilter
            && querystring.orderFilter !== '12'
            && querystring.orderFilter !== '6') {
            if (orderYear === querystring.orderFilter) {
                orderModel = new OrderModel(
                    customerOrder,
                    { config: config, countryCode: currentLocale.country }
                );
                orders.push(orderModel);
            }
        } else if (querystring.orderFilter
            && YEAR_AGO < orderTime
            && querystring.orderFilter === '12') {
            orderModel = new OrderModel(
                customerOrder,
                { config: config, countryCode: currentLocale.country }
            );
            orders.push(orderModel);
        } else if (SIX_MONTHS_AGO < orderTime) {
            orderModel = new OrderModel(
                customerOrder,
                { config: config, countryCode: currentLocale.country }
            );
            orders.push(orderModel);
        }
    }

    return {
        orders: orders,
        filterValues: filterValues
    };
}

/**
 * Creates an order model for the current customer
 * @param {Object} req - the request object
 * @returns {Object} an object of the customer's last order
 */
function getLastOrder(req) {
    var orderModel = null;
    var orderHistory = req.currentCustomer.raw.getOrderHistory();
    var customerOrders = orderHistory.getOrders(
        'status!={0}',
        'creationDate desc',
        Order.ORDER_STATUS_REPLACED
    );

    var order = customerOrders.first();

    if (order) {
        var currentLocale = Locale.getLocale(req.locale.id);

        var config = {
            numberOfLineItems: 'single'
        };

        orderModel = new OrderModel(order, { config: config, countryCode: currentLocale.country });
    }

    return orderModel;
}

/**
 * Creates an order model for the current customer
 * @param {Object} req - the request object
 * @returns {Object} an object of the customer's order
 */
function getOrderDetails(req) {
    var order = OrderMgr.getOrder(req.querystring.orderID);

    var config = {
        numberOfLineItems: '*'
    };

    var currentLocale = Locale.getLocale(req.locale.id);

    var orderModel = new OrderModel(
        order,
        { config: config, countryCode: currentLocale.country, containerView: 'order' }
    );

    return orderModel;
}

module.exports = {
    getOrders: getOrders,
    getLastOrder: getLastOrder,
    getOrderDetails: getOrderDetails
};
