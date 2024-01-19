'use strict'

var collections = require('*/cartridge/scripts/util/collections');

function getPriceObject(price) {
    if (!price || !price.isAvailable()) {
        return {};
    }
    return {
        "amount": price.value,
        "currencyCode": price.currencyCode
    }
}

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
            "amount": getPriceObject(amount)
        };
        discounts.push(discount);
    });
    return discounts;
}

module.exports = {
    getPriceObject: getPriceObject,
    getDiscountsObject: getDiscountsObject
}
