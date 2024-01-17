'use strict'

var collections = require('*/cartridge/scripts/util/collections');
var discountHelpers = require('*/cartridge/scripts/shoppay/helpers/discountHelpers');
var util = require('*/cartridge/scripts/util');

/**
 * Plain JS object that represents the discounted merchandize subtotal of the dw.order.LineItemCtnr
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 * @returns {Object} raw JSON representing the discounted merchandize subtotal
 */
function getSubtotal(basket) {
    return util.getPriceObject(basket.getAdjustedMerchandizeTotalPrice(false));
}

/**
 * Plain JS object that represents the shipping price and discounts in the dw.order.LineItemCtnr
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 * @returns {Object} raw JSON representing the shipping costs
 */
function getTotalShippingPrice(basket) {
    var shippingPrice = basket.getShippingTotalPrice();
    // only generate the shipping cost JSON object if a shipping price exists
    if (!shippingPrice || !shippingPrice.isAvailable()) {
        return {};
    }

    var originalTotal = util.getPriceObject(shippingPrice);
    var finalTotal = util.getPriceObject(basket.getAdjustedShippingTotalPrice());
    var discounts = discountHelpers.getDiscountsObject(basket.getAllShippingPriceAdjustments());

    return {
        discounts: discounts,
        originalTotal: originalTotal,
        finalTotal: finalTotal
    };
}

/**
 * Plain JS object that represents the total taxes of the dw.order.LineItemCtnr
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 * @returns {Object} raw JSON representing the order total tax
 */
function getTotalTax(basket) {
    return util.getPriceObject(basket.getTotalTax());
}

/**
 * Plain JS object that represents the total price of the dw.order.LineItemCtnr
 * @param {dw.order.LineItemCtnr} basket - the current line item container
 * @returns {Object} raw JSON representing the order total price
 */
function getTotal(basket) {
    return util.getPriceObject(basket.getTotalGrossPrice());
}

module.exports = {
    getSubtotal: getSubtotal,
    getTotalShippingPrice: getTotalShippingPrice,
    getTotalTax: getTotalTax,
    getTotal: getTotal
};
