'use strict'

var collections = require('*/cartridge/scripts/util/collections');
var array = require('*/cartridge/scripts/util/array');

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

function compareObjects(object1, object2) {
    // what is the type for null?
    var test = typeof object1;
    if ((typeof object1 !== typeof object2) || (Array.isArray(object1) !== Array.isArray(object2))) {
        // does this fail for null?
        return false;
    }
    if (Array.isArray(object1)) {
        if (object1.length !== object2.length) {
            return false;
        }
        for (var i = 0; i < object1.length; i++) {
            var refObject = object1[i];
            var foundMatch = array.find(object2, function(element) {
                return compareObjects(refObject, element) === true;
            });
            if (!foundMatch) {
                return false;
            }
        }
    } else if (typeof object1 === 'object') {
        var keys1 = Object.keys(object1);
        var keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (var i = 0; i < keys1.length; i++) {
            var key = keys1[i];
            var isMatch = compareObjects(object1[key], object2[key]);
            if (!isMatch) {
                return false;
            }
        }
    } else {
        // boolean, string, number
        if (object1 !== object2) {
            return false;
        }
    }
    return true;
}

module.exports = {
    getPriceObject: getPriceObject,
    getDiscountsObject: getDiscountsObject,
    compareObjects: compareObjects
}
