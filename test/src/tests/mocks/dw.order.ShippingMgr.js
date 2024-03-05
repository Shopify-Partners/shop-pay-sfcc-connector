const createGiftCertificateLineItems = () => {
    return []
}

const defaultShippingMethod = {
    ID: 1,
    displayName: 'Standard',
    label: 'Standard',
    amount: {
        amount: 0.00,
        currencyCode: 'USD'
    },
    code: 'STANDARD',
    detail: 'Ground Shipping',
    minDeliveryDate: '2024-01-01',
    maxDeliveryDate: '2026-01-01',
    deliveryExpectationLabel: 'Orders ship within 2 business days',
    giftCertificateLineItems: createGiftCertificateLineItems()
}

const createShipmentShippingModel = () => {
    return {
        applicableShippingMethods: [
            {
                ID: 1,
                displayName: 'Standard',
                label: 'Standard',
                amount: {
                    amount: 0.00,
                    currencyCode: 'USD'
                },
                code: 'STANDARD',
                detail: 'Ground Shipping',
                minDeliveryDate: '2024-01-01',
                maxDeliveryDate: '2026-01-01',
                deliveryExpectationLabel: 'Orders ship within 2 business days',
                getGiftCertificateLineItems: () => {
                    return [];
                }
            },
            {
                ID: 2,
                displayName: 'Express',
                label: 'Express',
                amount: {
                    amount: 20.00,
                    currencyCode: 'USD'
                },
                code: 'EXPRESS',
                detail: '2-day Shipping',
                minDeliveryDate: '2024-01-01',
                maxDeliveryDate: '2025-01-01',
                deliveryExpectationLabel: 'Order ships same business day if order placed before 12pm EST',
                getGiftCertificateLineItems: () => {
                    return [];
                }
            }
        ],
        getApplicableShippingMethods: () => {
            return [
                {
                    ID: 1,
                    displayName: 'Standard',
                    label: 'Standard',
                    amount: {
                        amount: 0.00,
                        currencyCode: 'USD'
                    },
                    code: 'STANDARD',
                    detail: 'Ground Shipping',
                    minDeliveryDate: '2024-01-01',
                    maxDeliveryDate: '2026-01-01',
                    deliveryExpectationLabel: 'Orders ship within 2 business days',
                    custom: {
                        estimatedArrivalTime: 'Within 2 business days',
                        storePickupEnabled: false
                    }
                },
                {
                    ID: 2,
                    displayName: 'Express',
                    label: 'Express',
                    amount: {
                        amount: 20.00,
                        currencyCode: 'USD'
                    },
                    code: 'EXPRESS',
                    detail: '2-day Shipping',
                    minDeliveryDate: '2024-01-01',
                    maxDeliveryDate: '2025-01-01',
                    deliveryExpectationLabel: 'Order ships same business day if order placed before 12pm EST',
                    custom: {
                        estimatedArrivalTime: 'Within 1 business day',
                        storePickupEnabled: false
                    }
                }
            ];
        },
        getShippingCost: () => {
            return {
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
                },
                getAmount: () => {
                    return {
                        amount: {
                            amount: 10.00,
                            currencyCode: 'USD'
                        },
                        isAvailable: () => {
                            return true
                        }
                    }
                }
            };
        }
    };
}

module.exports = {
    getDefaultShippingMethod: () => {
        return defaultShippingMethod;
    },
    getShipmentShippingModel: (shipment) => {
        return createShipmentShippingModel(shipment);
    },
    getGiftCertificateLineItems: () => {
        return createGiftCertificateLineItems(shipment);
    }
};
