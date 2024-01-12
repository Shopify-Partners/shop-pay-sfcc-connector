'use strict'

function getPriceObject(price) {
    if (!price || !price.isAvailable()) {
        return {};
    }
    return {
        "amount": price.value,
        "currencyCode": price.currencyCode
    }
}

module.exports = {
    getPriceObject: getPriceObject
}
