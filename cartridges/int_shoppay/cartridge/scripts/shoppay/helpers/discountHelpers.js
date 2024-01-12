'use strict'

function getDiscountCodes() {
    return [
        "LOYALTY15"
    ];
}

function getDiscounts() {
    return [
        {
            "label": "15% off",
            "amount": {
                "amount": 3.00,
                "currencyCode": "USD"
            }
        }
    ];
}

module.exports = {
    getDiscountCodes: getDiscountCodes,
    getDiscounts: getDiscounts
};
