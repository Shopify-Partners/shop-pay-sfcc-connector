'use strict'

var collections = require('*/cartridge/scripts/util/collections');
var util = require('*/cartridge/scripts/util');

/**
 * Plain JS object that represents the merchandize total price of the dw.order.LineItemCtnr
 * @param {dw.order.LineItemCtnr} basket
 * @returns {Object} raw JSON representing the merchandize total price
 */
function getTotal(basket) {
    return util.getPriceObject(basket.getTotalGrossPrice());
}
function getSubtotal(basket) {
    return util.getPriceObject(basket.getAdjustedMerchandizeTotalPrice(false));
}

/**
 * Plain JS object that represents the shipping price and discounts in the dw.order.LineItemCtnr
 * @param {dw.order.LineItemCtnr} basket
 * @returns {Object} raw JSON representing the shipping costs
 */
function getTotalShippingPrice(basket) {
    var shippingPrice = basket.getShippingTotalPrice();
    // only generate the shipping cost JSON object if a shipping price exists
    if (!shippingPrice || !shippingPrice.isAvailable()) {
        return {};
    }

    var originalTotal = {
        "amount": shippingPrice.value,
        "currencyCode": shippingPrice.currencyCode
    };

    var finalTotal = util.getPriceObject(basket.getAdjustedShippingTotalPrice());

    var discounts = [];
    var shippingAdjustments = basket.getAllShippingPriceAdjustments();
    if (shippingAdjustments.length > 0) {
        collections.forEach(shippingAdjustments, function(shippingAdjustment) {
            if (shippingAdjustment.price.isAvailable()) {
                var discount = {
                    "label": shippingAdjustment.lineItemText,
                    "amount": {
                        "amount": shippingAdjustment.price.value * -1.00,
                        "currencyCode": shippingAdjustment.price.currencyCode
                    }
                };
            }
            discounts.push(discount);
        });
    }

    return {
        discounts: discounts,
        originalTotal: originalTotal,
        finalTotal: finalTotal
    };
}

/**
 * Plain JS object that represents the total taxes of the dw.order.LineItemCtnr
 * @param {dw.order.LineItemCtnr} basket
 * @returns {Object} raw JSON representing the order total tax
 */
function getTotalTax(basket) {
    return util.getPriceObject(basket.getTotalTax());
}

/**
 * Plain JS object that represents the total price of the dw.order.LineItemCtnr
 * @param {dw.order.LineItemCtnr} basket
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
