'use strict'

var collections = require('*/cartridge/scripts/util/collections');
var util = require('*/cartridge/scripts/util');

/**
 * Plain JS object that represents the price adjustments in a container
 * @param {dw.util.Collection<dw.order.PriceAdjustment>} priceAdjustments - a collection of a container's price adjustments
 * @returns {Object} raw JSON representing a collection of price adjustments
 */
function getDiscountsObject(priceAdjustments) {
    var discounts = [];
    collections.forEach(priceAdjustments, function(priceAdjustment) {
        var priceValue = priceAdjustment.price.valueOrNull;
        var amount = priceValue != null && priceValue >= 0 ? priceAdjustment.price : priceAdjustment.price.multiply(-1.0);
        var discount = {
            "label": priceAdjustment.promotion ? priceAdjustment.promotion.name : '',
            "amount": util.getPriceObject(amount)
        };
        discounts.push(discount);
    });
    return discounts;
}

/**
 * An array of coupon codes applied to a cart or order
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 * @returns {Array} an array of coupon codes applied to the basket
 */
function getDiscountCodes(basket) {
    var couponCodes = [];
    var couponLineItems = basket.couponLineItems;
    collections.forEach(couponLineItems, function (cli) {
        if (cli.applied) {
            couponCodes.push(cli.couponCode);
        }
    });

    return couponCodes;
}

/**
 * Plain JS object that represents the order level price adjustments in the basket
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 * @returns {Object} raw JSON representing the order level price adjustments in the basket
 */
function getOrderDiscounts(basket) {
    return getDiscountsObject(basket.getPriceAdjustments());
}

module.exports = {
    getDiscountsObject: getDiscountsObject,
    getDiscountCodes: getDiscountCodes,
    getOrderDiscounts: getOrderDiscounts
};
