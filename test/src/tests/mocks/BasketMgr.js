/* eslint-disable no-unused-vars */
const ArrayList = require('../mocks/dw.util.Collection');
const Money = require('../mocks/dw.value.Money');
const Customer = require('../mocks/dw.customer.Customer');
const ProductMgr = require('../mocks/dw.catalog.ProductMgr');

class BasketMgr {
    constructor() {
        this.productLineItems = [];
        this.paymentInstruments = [];
        this.paymentStatus = { value: 0 };
        this.status = { value: 0 };
        this.customerEmail = 'qa@unittest.com';
        this.product = ProductMgr.getProduct();
        this.billingAddress = {
            firstName: 'Ricky',
            lastName: 'Bobby',
            address1: '54321 First Last Lane',
            address2: '',
            city: 'West Palm',
            postalCode: '02135',
            phone: '011-235-8137',
            stateCode: 'FL',
            countryCode: {
                displayValue: 'United States',
                value: 'US'
            },
            setPhone: (phoneNumber) => {},
            getCountryCode: () => { return { value: this.countryCode }; },
            setCountryCode: (countryCode) => {},
            setFirstName: (other) => { },
            setLastName: (other) => { },
            setAddress1: (other) => {},
            setAddress2: (other) => {},
            setCity: (other) => {},
            setPostalCode: (other) => {},
            setStateCode: (other) => {}
        },
        this.shipments = [{
            UUID: '1234-1234-1234-1235',
            setShippingMethod: function (shippingMethod) {
                return shippingMethod;
            },
            shippingAddress: {
                address1: '1 Drury Lane',
                address2: null,
                countryCode: {
                    displayValue: 'United States',
                    value: 'US'
                },
                firstName: 'The Muffin',
                lastName: 'Man',
                city: 'Far Far Away',
                phone: '333-333-3333',
                postalCode: '04330',
                stateCode: 'ME'
            },
            shippingMethod: {
                ID: '001',
                displayName: 'Ground',
                description: 'Order received within 7-10 business days',
                custom: {
                    estimatedArrivalTime: '7-10 Business Days'
                }
            },
            productLineItems: this.getCurrentBasket(this.product).getProductLineItems().toArray(),
            trackingNumber: '999-999-999-9999999',
            gift: true
        }],
        this.totalGrossPrice = new Money(20.00);
        this.totalNetPrice = new Money(20.00);
        this.customer = new Customer();
        this.allProductLineItems = new ArrayList(this.productLineItems);
        this.shippingTotalPrice = new Money(7.99);
        this.totalTax = new Money(0);
        this.paymentInstruments = this.getCurrentBasket(this.product).getPaymentInstruments();
        this.orderNo = '000101899';
        this.customerNo = this.getCustomer().ID;
        this.customerName = this.getCustomer().name;
    }

    getCustomer = () => {
        const customerObj = new Customer();
        const fname = customerObj.profile.firstName;
        const lname = customerObj.profile.lastName;
        return {
            ID: customerObj.ID,
            name: `${fname} ${lname}`
        };
    };

    getCurrentBasket = () => {
        return {
            getProductLineItems: () => {
                const productID = this.product.ID;
                return {
                    toArray: () => {
                        return [
                            {
                                product: this.product,
                                productID: productID,
                                productName: this.product.name,
                                quantityValue: 4.99,
                                quantity: { value: 1 },
                                adjustedPrice: { value: 10 },
                                purchasePrice: 12,
                                purchasePriceValue: 10,
                                originalPrice: 99,
                                originalPriceValue: 9,
                                masterProduct: this.product.getAllCategories(),
                                getAdjustedMerchandizeTotalPrice: this.getAdjustedMerchandizeTotalPrice(),
                                optionProductLineItems: [
                                    {
                                        optionID: 'optionId1',
                                        optionValueID: 'selectedValueId1',
                                        productName: 'productName1',
                                        lineItemText: 'lineItemText1',
                                        basePrice: {
                                            value: .99
                                        }
                                    },
                                    {
                                        optionID: 'optionId2',
                                        optionValueID: 'selectedValueId2',
                                        productName: 'productName2',
                                        lineItemText: 'lineItemText2',
                                        basePrice: {
                                            value: 1.99
                                        }
                                    }
                                ],
                                bonusProductLineItem: {
                                    originalPrice: 100,
                                    price: 50,
                                    originalPriceValue: 100,
                                    priceValue: 50
                                },
                                bundledProductLineItems: [
                                    {
                                        isProdBundle: true,
                                        prodBundleIDs: [
                                            "sony-ps3-consoleM",
                                            "easports-nascar-09-ps3M",
                                            "easports-monopoly-ps3M",
                                            "namco-eternal-sonata-ps3M",
                                            "sony-warhawk-ps3M"
                                        ]
                                    }
                                ]
                            },
                        ];
                    },
                };
            },

            getPaymentInstruments: () => {
                const paymentInstruments = [{
                    creditCardNumber: '411111111111',
                    creditCardType: 'visa',
                    creditCardExpirationMonth: '03',
                    creditCardExpirationYear: '30',
                    creditCardNumberLastDigits: '1111',
                    maskedCreditCardNumber: '############',
                }];
                return paymentInstruments;
            },

            getTotalGrossPrice: () => {
                const grossPrice = new Money(99.99);
                const value = grossPrice.value;
                return {
                    value: value,
                    getValue: () => {
                        return {
                            valueOf: () => {
                                return value;
                            }
                        };
                    }
                };
            },
            customerEmail: this.customerEmail
        };
    };

    getAdjustedMerchandizeTotalPrice = (param) => {
        if (param === false) {
            return {
                subtract: () => {
                    return {
                        value: 1
                    };
                },
            };
        }
        return {
            value: 1
        };
    };

    getAdjustedShippingTotalPrice = () => {
        return 1.99;
    };
}

module.exports = BasketMgr;
