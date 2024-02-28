'use strict'

/* Script Modules */
var array = require('*/cartridge/scripts/util/array');
var collections = require('*/cartridge/scripts/util/collections');

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('ShopPay', 'ShopPay');


/**
 * Converts an SFCC Money object into the ShopPayMoney object
 * @param {dw.value.Money} price - a price as an SFCC Money object
 * @returns {Object} a price as a ShopPayMoney object
 */
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

/**
 * Determines whether a value should be considered equivalent to null for purposes of comparing payment request
 * objects
 * @param {*} value - The value to check
 * @returns {boolean} true if the value should be considered equivalent to null
 */
function isNull(value) {
    var nullEquivalents = ["undefined", "", null];
    return nullEquivalents.indexOf(value) >= 0;
}

/**
 * Determines if two objects are equivalent (note that for purposes of this functionality, the values
 * "undefined", null, and "" are considered equivalent).
 * @param {Object} object1 - The first object to compare
 * @param {Object} object2 - The second object to compare
 * @returns {boolean} true if the objects are equivalent, otherwise false
 */
function matchObjects(object1, object2) {
    try {
        // typeof array and typeof null is 'object' so more explicit comparisons are required
        var obj1IsNull = isNull(object1);
        var obj2IsNull = isNull(object2);
        if (obj1IsNull && obj2IsNull) {
            return true;
        }
        if ((obj1IsNull !== obj2IsNull)
            || (typeof object1 !== typeof object2)
            || (Array.isArray(object1) !== Array.isArray(object2))
        ) {
            return false;
        }
        if (Array.isArray(object1)) {
            if (object1.length !== object2.length) {
                return false;
            }
            for (var i = 0; i < object1.length; i++) {
                var refObject = object1[i];
                var foundMatch = array.find(object2, function(element) {
                    return matchObjects(refObject, element) === true;
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
                var isMatch = matchObjects(object1[key], object2[key]);
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
    } catch (e) {
        // some difference between the objects caused an error
        var test = e;
        Logger.error('[common.js] error: \n\r' + e.message + '\n\r' + e.stack);
        return false;
    }
}

module.exports = {
    getDiscountsObject: getDiscountsObject,
    getPriceObject: getPriceObject,
    isNull: isNull,
    matchObjects: matchObjects
}
