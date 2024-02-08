const mockPaymentRequestObject = {
    shippingAddress: null,
    discountCodes: [
        'LOYALTY15'
    ],
    lineItems: [
        {
            label: 'T-Shirt',
            quantity: 2,
            sku: 'M1234',
            requiresShipping: true,
            image: {
                url: 'https://example.com/myshirtimage.jpg',
                alt: 'Red T-Shirt'
            },
            originalItemPrice: {
                amount: 10.00,
                currencyCode: 'USD'
            },
            itemDiscounts: [],
            finalItemPrice: {
                amount: 10.00,
                currencyCode: 'USD'
            },
            originalLinePrice: {
                amount: 20.00,
                currencyCode: 'USD'
            },
            lineDiscounts: [],
            finalLinePrice: {
                amount: 20.00,
                currencyCode: 'USD'
            }
        }
    ],
    shippingLines: [],
    deliveryMethods: [],
    locale: 'en',
    presentmentCurrency: 'USD',
    subtotal: {
        amount: 20.00,
        currencyCode: 'USD'
    },
    discounts: [
        {
            label: '15% off',
            amount: {
                amount: 3.00,
                currencyCode: 'USD'
            }
        }
    ],
    total: {
        amount: 17.00,
        currencyCode: 'USD'
    },
}

const mockShippingMethod = {
    countryCode: 'US',
    postalCode: '60661',
    provinceCode: null,
    city: 'Chicago',
    firstName: 'Jane',
    lastName: 'Doe',
    address1: '500 W Madison St',
    address2: 'Ste 2200',
    phone: '3125551212',
    email: 'jane.doe@example.com',
    companyName: null
}

const mockShippingLinesArray = [
    {
        label: 'Standard',
        amount: {
            amount: 10.00,
            currencyCode: 'USD'
        },
        code: 'STANDARD'
    }
];

const mockDeliveryMethodsArray = [
    {
        label: 'Standard',
        amount: {
            amount: 0.00,
            currencyCode: 'USD'
        },
        code: 'STANDARD',
        detail: 'Ground Shipping',
        minDeliveryDate: '2024-01-01',
        maxDeliveryDate: '2026-01-01',
        deliveryExpectationLabel: 'Orders ship within 2 business days'
    },
    {
        label: 'Express',
        amount: {
            amount: 20.00,
            currencyCode: 'USD'
        },
        code: 'EXPRESS',
        detail: '2-day Shipping',
        minDeliveryDate: '2024-01-01',
        maxDeliveryDate: '2025-01-01',
        deliveryExpectationLabel: 'Order ships same business day if order placed before 12pm EST'
    }
];

const mockTotalShippingPrice = {
    discounts: [
        {
            label: 'free shipping',
            amount: {
                amount: 10.00,
                currencyCode: 'USD'
            }
        }
    ],
    originalTotal: {
        amount: 10.00,
        currencyCode: 'USD'
    },
    finalTotal: {
        amount: 0.00,
        currencyCode: 'USD'
    }
};

const mockTotalTax = {
    amount: 1.06,
    currencyCode: 'USD'
}

const buildSubmitPaymentRequest = () => {
    var mockSubmitPaymentRequest = mockPaymentRequestObject;
    mockSubmitPaymentRequest.shippingAddress = mockShippingMethod;
    mockSubmitPaymentRequest.shippingLines = mockShippingLinesArray;
    mockSubmitPaymentRequest.deliveryMethods = mockDeliveryMethodsArray;
    mockSubmitPaymentRequest['totalShippingPrice'] = mockTotalShippingPrice;
    mockSubmitPaymentRequest['totalTax'] = mockTotalTax;

    return mockSubmitPaymentRequest;
}

const mockShopPayPaymentRequestSessionCreateResponse = {
    data: {
        shopPayPaymentRequestSessionCreate: {
            shopPayPaymentRequestSession: {
                sourceIdentifier: 'xyz123',
                token: 'db4eede13822684b13a607823b7ba40d',
                checkoutUrl: 'https://shop.app/checkout/1/spe/db4eede13822684b13a607823b7ba40d/shoppay',
                paymentRequest: mockPaymentRequestObject
            },
            userErrors: []
        }
    }
}

const mockShopPayPaymentRequestSessionSubmitResponse = {
    data: {
        shopPayPaymentRequestSessionSubmit: {
            paymentRequestReceipt: {
                token: 'a607823b7ba40ddb4eede13822684b13',
                processingStatusType: 'ready'
            },
            userErrors: []
        }
    }
}

const mockOrderDetailsResponse = {
    "data": {
        "orders": {
            "edges": [
                {
                    "node": {
                        "billingAddress": {
                            "firstName": "Kristin",
                            "lastName": "Van Andel",
                            "address1": "500 W Madison St",
                            "address2": null,
                            "city": "Chicago",
                            "provinceCode": "IL",
                            "zip": "60661",
                            "countryCodeV2": "US",
                            "phone": "+12085551212"
                        },
                        "email": "kristintest559@gmail.com",
                        "id": "gid://shopify/Order/5745722753344",
                        "name": "#1023",
                        "sourceIdentifier": "4d187167221f39d4fea6e5f1d3"
                    }
                }
            ]
        }
    }
};

/**
 * return mock payment request
 * @param {string} mockType type of mock payment request to be recieved
 * @returns {Object} payment request
 */
function getMockPaymentRequest(mockType) {
    var request = {};
    switch (mockType) {
        case 'createSession':
            request = mockPaymentRequestObject;
            break;

        case 'sessionSubmit':
            request = buildSubmitPaymentRequest();
            break;

        default:
            break;
    }
    return request;
}

/**
 * return mock response
 * @param {string} mockType type of mock response to be received
 * @returns {Object} response
 */
function getMockResponse (mockType) {
    var response = {};
    switch (mockType) {
        case 'createSession':
            response = mockShopPayPaymentRequestSessionCreateResponse;
            break;

        case 'sessionSubmit':
            response = mockShopPayPaymentRequestSessionSubmitResponse;
            break;

        case 'orderDetails':
            response = mockOrderDetailsResponse;
            break;

        default:
            break;
    }
    return response;
}

/**
 * Filters the HTTP service response to remove sensitive information before logging the request
 * @param {Object} request
 * @returns {string} the filtered log message
 */
function getStorefrontRequestLogMessage(request) {
    try {
        var jsonBody = JSON.parse(request);
        if (jsonBody.variables && jsonBody.variables.paymentRequest) {
            var paymentRequest = jsonBody.variables.paymentRequest;
            if (paymentRequest != null && paymentRequest.shippingAddress != null) {
                // replace shipping address object with string to remove customer info
                paymentRequest.shippingAddress = "****";
            }
        }
        return JSON.stringify(jsonBody);
    } catch (e) {
        // no action - log request as is
    }
    return request;
}

/**
 * Filters the HTTP service response to remove sensitive information before logging the response
 * @param {Object} response
 * @returns {string} the filtered log message
 */
function getStorefrontResponseLogMessage(response) {
    try {
        var responseBody = response.text;
        var jsonBody = JSON.parse(responseBody);
        if (!jsonBody.data) {
            return response.text;
        }
        var data = jsonBody.data;
        // Session Create
        if (data.shopPayPaymentRequestSessionCreate
            && data.shopPayPaymentRequestSessionCreate.shopPayPaymentRequestSession
            && data.shopPayPaymentRequestSessionCreate.shopPayPaymentRequestSession.token
        ) {
            // mask session token
            data.shopPayPaymentRequestSessionCreate.shopPayPaymentRequestSession.token = "****";
        // Session Submit
        } else if (data.shopPayPaymentRequestSessionSubmit
            && data.shopPayPaymentRequestSessionSubmit.paymentRequestReceipt
            && data.shopPayPaymentRequestSessionSubmit.paymentRequestReceipt.token
        ) {
            // mask payment token
            jsonBody.data.shopPayPaymentRequestSessionSubmit.paymentRequestReceipt.token = "****";
        }
        return JSON.stringify(jsonBody);
    } catch (e) {
        // no action - log response as is
    }
    return response.text;
}

function getAdminRequestLogMessage(request) {
    // Kristin TODO
    return request;
};

function getAdminResponseLogMessage(response) {
    // Kristin TODO
    return response.text;
};

module.exports = {
    getMockPaymentRequest: getMockPaymentRequest,
    getMockResponse: getMockResponse,
    getStorefrontRequestLogMessage: getStorefrontRequestLogMessage,
    getStorefrontResponseLogMessage: getStorefrontResponseLogMessage,
    getAdminRequestLogMessage: getAdminRequestLogMessage,
    getAdminResponseLogMessage: getAdminResponseLogMessage
};
