'use strict';

function getLineItems() {
    return [
        {
            "label": "T-Shirt",
            "quantity": 2,
            "sku": "M1234",
            "requiresShipping": true,
            "image": {
                "url": "https://example.com/myshirtimage.jpg",
                "alt": "Red T-Shirt"
            },
            "originalItemPrice": {
                "amount": 10.00,
                "currencyCode": "USD"
            },
            "itemDiscounts": [],
            "finalItemPrice": {
                "amount": 10.00,
                "currencyCode": "USD"
            },
            "originalLinePrice": {
                "amount": 20.00,
                "currencyCode": "USD"
            },
            "lineDiscounts": [],
            "finalLinePrice": {
                "amount": 20.00,
                "currencyCode": "USD"
            }
        }
    ];
}

module.exports = {
    getLineItems: getLineItems
}
