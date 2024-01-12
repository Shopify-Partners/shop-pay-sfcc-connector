const mockPaymentRequestObject = {
    shippingAddress: null,
    discountCodes: [
        "LOYALTY15"
    ],
    lineItems: [
        {
            label: "T-Shirt",
            quantity: 2,
            sku: "M1234",
            requiresShipping: true,
            image: {
                url: "https://example.com/myshirtimage.jpg",
                alt: "Red T-Shirt"
            },
            originalItemPrice: {
                amount: 10.00,
                currencyCode: "USD"
            },
            itemDiscounts: [],
            finalItemPrice: {
                amount: 10.00,
                currencyCode: "USD"
            },
            originalLinePrice: {
                amount: 20.00,
                currencyCode: "USD"
            },
            lineDiscounts: [],
            finalLinePrice: {
                amount: 20.00,
                currencyCode: "USD"
            }
        }
    ],
    shippingLines: [],
    deliveryMethods: [],
    locale: "en",
    presentmentCurrency: "USD",
    subtotal: {
        amount: 20.00,
        currencyCode: "USD"
    },
    discounts: [
        {
            label: "15% off",
            amount: {
                amount: 3.00,
                currencyCode: "USD"
            }
        }
    ],
    total: {
        amount: 17.00,
        currencyCode: "USD"
    },
}

const mockShippingMethod = {
    countryCode: "US",
    postalCode: "60661",
    provinceCode: null,
    city: "Chicago",
    firstName: "Jane",
    lastName: "Doe",
    address1: "500 W Madison St",
    address2: "Ste 2200",
    phone: "3125551212",
    email: "jane.doe@example.com",
    companyName: null
}

const mockShippingLinesArray = [
    {
        label: "Standard",
        amount: {
            amount: 10.00,
            currencyCode: "USD"
        },
        code: "STANDARD"
    }
];

const mockDeliveryMethodsArray = [
    {
        label: "Standard",
        amount: {
            amount: 0.00,
            currencyCode: "USD"
        },
        code: "STANDARD",
        detail: "Ground Shipping",
        minDeliveryDate: '2024-01-01',
        maxDeliveryDate: '2026-01-01',
        deliveryExpectation: "Orders ship within 2 business days"
    },
    {
        label: "Express",
        amount: {
            amount: 20.00,
            currencyCode: "USD"
        },
        code: "EXPRESS",
        detail: "2-day Shipping",
        minDeliveryDate: '2024-01-01',
        maxDeliveryDate: '2025-01-01',
        deliveryExpectation: "Order ships same business day if order placed before 12pm EST"
    }
];

const mockTotalShippingPrice = {
    discounts: [
        {
            label: "free shipping",
            amount: {
                amount: 10.00,
                currencyCode: "USD"
            }
        }
    ],
    originalTotal: {
        amount: 10.00,
        currencyCode: "USD"
    },
    finalTotal: {
        amount: 0.00,
        currencyCode: "USD"
    }
};

const mockTotalTax = {
    amount: 1.06,
    currencyCode: "USD"
}

const buildSubmitPaymetRequest = () => {
    var mockSubmitPaymentRequest = mockPaymentRequest;
    mockSubmitPaymentRequest.shippingAddress = mockShippingMethod;
    mockSubmitPaymentRequest['paymentMethod'] = 'db4eede13822684b13a607823b7ba40d';
    mockSubmitPaymentRequest.shippingLines = mockShippingLinesArray;
    mockSubmitPaymentRequest.deliveryMethods = mockDeliveryMethodsArray;
    mockSubmitPaymentRequest['totalShippingPrice'] = mockTotalShippingPrice;
    mockSubmitPaymentRequest['totalTax'] = mockTotalTax;

    return mockSubmitPaymentRequest;
}

/**
 * return mock payment request
 * @param  {string} mockType current service credential
 * @returns {object} payment request
 */
function getMockPaymentRequest(mockType) {
    switch (mockType) {
        case "createSession":
            return JSON.stringify(mockPaymentRequest);
            break;

        case "sessionSubmit":
            return JSON.stringify(buildSubmitPaymetRequest());
            break;
    
        default:
            return {};
            break;
    }
}

module.exports = {
    getMockPaymentRequest: getMockPaymentRequest
};
