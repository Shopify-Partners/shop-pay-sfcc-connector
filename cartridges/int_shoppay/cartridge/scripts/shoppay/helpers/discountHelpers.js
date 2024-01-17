'use strict'

var collections = require('*/cartridge/scripts/util/collections');
var util = require('*/cartridge/scripts/util');

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

function getDiscounts(basket) {
    return getDiscountsObject(basket.getPriceAdjustments());
}

module.exports = {
    getDiscountsObject: getDiscountsObject,
    getDiscountCodes: getDiscountCodes,
    getDiscounts: getDiscounts
};
