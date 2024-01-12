'use strict'

function getSubtotal() {
    return {
        "amount": 20.00,
        "currencyCode": "USD"
    };
}

function getTotalShippingPrice() {
    /* return {
        "discounts": [
            {
                "label": "free shipping",
                "amount": {
                    "amount": 10.00,
                    "currencyCode": "USD"
                }
            }
        ],
        "originalTotal": {
            "amount": 10.00,
            "currencyCode": "USD"
        },
        "finalTotal": {
            "amount": 0.00,
            "currencyCode": "USD"
        }
    }; */
    return {};
}

function getTotalTax() {
    return {
        "amount": 1.06,
        "currencyCode": "USD"
    };
}

function getTotal() {
    return {
        "amount": 18.06,
        "currencyCode": "USD"
    };
}

module.exports = {
    getSubtotal: getSubtotal,
    getTotalShippingPrice: getTotalShippingPrice,
    getTotalTax: getTotalTax,
    getTotal: getTotal
};
