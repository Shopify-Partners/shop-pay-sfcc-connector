'use strict'

/* Script Modules */
var collections = require('*/cartridge/scripts/util/collections');
var common = require('*/cartridge/scripts/shoppay/shoppayCommon');

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
    return common.getDiscountsObject(basket.getPriceAdjustments());
}

module.exports = {
    getDiscountCodes: getDiscountCodes,
    getOrderDiscounts: getOrderDiscounts
};
