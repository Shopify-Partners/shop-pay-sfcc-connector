const ArrayList = require('../mocks/util/Collection')
const ProductLineItem = require('../mocks/dw.order.ProductLineItem')
const Money = require('../mocks/dw.value.Money')
const ProductMgr = require('../mocks/dw.catalog.ProductMgr')
const ShippingMgr = require('../mocks/dw.order.ShippingMgr')
const PaymentMgr = require('../mocks/dw.order.PaymentMgr')

const mockProduct = new ProductMgr.getProduct()
const priceObject = new Money(6.66)

function getCurrentBasket() {
  return {
    allProductLineItems: new ArrayList([
      {
        UUID: undefined,
        getOptionProductLineItems: function () {
          return new ArrayList();
        },
        bonusProductLineItems: [
            {
                originalPrice: 100,
                price: 50,
                originalPriceValue: 100,
                priceValue: 50
            }
        ],
        bonusProducts: new ArrayList([]),
        custom: {},
        quantityValue: 0,
        product: new ArrayList(),
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
        ],
      },
    ]),
    defaultShipment: {
      shippingAddress: {
        firstName: 'The Muffin',
        lastName: 'Man',
        address1: '1 Drury Lane',
        address2: '',
        city: 'Far Far Away',
        postalCode: '04330',
        countryCode: { value: 'us' },
        phone: '617-555-1234',
        stateCode: 'ME',

        setFirstName: function (firstNameInput) {
          this.firstName = firstNameInput;
        },
        setLastName: function (lastNameInput) {
          this.lastName = lastNameInput;
        },
        setAddress1: function (address1Input) {
          this.address1 = address1Input;
        },
        setAddress2: function (address2Input) {
          this.address2 = address2Input;
        },
        setCity: function (cityInput) {
          this.city = cityInput;
        },
        setPostalCode: function (postalCodeInput) {
          this.postalCode = postalCodeInput;
        },
        setStateCode: function (stateCodeInput) {
          this.stateCode = stateCodeInput;
        },
        setCountryCode: function (countryCodeInput) {
          this.countryCode.value = countryCodeInput;
        },
        setPhone: function (phoneInput) {
          this.phone = phoneInput;
        },
      },
      setShippingMethod: function () {},
      createShippingAddress: function () {},
      getGiftCertificateLineItems: function() { return new ArrayList([]) }
    },
    totalGrossPrice: {
      value: 250.0,
    },
    shipments: ShippingMgr.getShipmentShippingModel().applicableShippingMethods,
    allLineItems: new ArrayList(),
    couponLineItems: new ArrayList(),
    allShippingPriceAdjustments: new ArrayList(),
    giftCertificateLineItems: new ArrayList(),
    currencyCode: priceObject.currencyCode,
    productLineItems: [
        {
            product: mockProduct,
            quantityValue: 1,
            label: 'Skin Care',
            quantity: 2,
            productID: 'M1234',
            sku: 'NG3614270264405',
            requiresShipping: true,
            price: {
                currencyCode: 'USD'
            },
            image: {
                url: 'https://sforce.co/43Pig4s',
                alt: 'Belle de Teint'
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
            },
            netPrice: {
                amount: 99,
                currencyCode: 'USD'
            },
            optionProductLineItems: [
                {
                    optionID: 'optionId1',
                    optionValueID: 'selectedValueId1',
                    productName: 'productName1',
                    lineItemText: 'lineItemText1',
                    basePrice: {
                        value: 49.00
                    },
                    adjustedPrice: {
                        value: 29.00
                    }
                },
                {
                    optionID: 'optionId2',
                    optionValueID: 'selectedValueId2',
                    productName: 'productName2',
                    lineItemText: 'lineItemText2',
                    basePrice: {
                        value: 1.99
                    },
                    adjustedPrice: {
                        value: 29.00
                    }
                }
            ],
            priceAdjustments: [
                {
                    price: {
                        value: priceObject.value,
                        valueOrNull: priceObject.value,
                        currencyCode: priceObject.currencyCode,
                        isAvailable: () => {
                            return true
                        }
                    },
                }
            ],
            getNetPrice: function () {
                const netPrice = new Money(21.12)
                const value = netPrice.value
                return {
                    add: () => {
                        return {
                            value: value,
                            currencyCode: 'USD',
                            isAvailable: () => {
                                return true
                            }
                        }
                    }
                }
            },
            getAdjustedNetPrice: function () {
                const adjustedNetPrice = new Money(13.13)
                const value = adjustedNetPrice.value
                return {
                    value: value,
                    getValue: () => {
                        return {
                            valueOf: () => {
                                return value;
                            }
                        }
                    },
                    add: () => {
                        return {
                            value: 13.13,
                            currencyCode: 'USD',
                            isAvailable: () => {
                                return true
                            }
                        }
                    }
                }
            }
        },
    ],
    bonusDiscountLineItems: new ArrayList([
      {
        UUID: undefined,
        getBonusProductPrice: function () {
          return {
            toFormattedString: function () {
              return 'someFormattedString';
            },
          };
        },
        bonusProductLineItems: new ArrayList([]),
        bonusProducts: new ArrayList([]),
        custom: {},
      },
    ]),
    getProductLineItems: function () {
        return new ArrayList(this.productLineItems);
    },
    getBonusDiscountLineItems: function () {
      return this.bonusDiscountLineItems;
    },
    getShipments() {
      return this.shipments;
    },
    getDefaultShipment() {
        return this.defaultShipment;
    },
    getShippingTotalPrice() {
        return {
            value: 10.99,
            currencyCode: 'USD',
            isAvailable: () => {
                return true
            }
        }
    },
    getAdjustedShippingTotalPrice() {
        return {
            value: 7.99,
            currencyCode: 'USD',
            isAvailable: () => {
                return true
            }
        }
    },
    getAllShippingPriceAdjustments() {
        return this.allShippingPriceAdjustments
    },
    updateCurrency() {},
    getAdjustedMerchandizeTotalPrice(param) {
        if (param === false) {
            return {
                value: 6.66,
                currencyCode: 'USD',
                subtract: () => {
                    return {
                        value: 1
                    };
                },
                isAvailable: () => {
                    return true
                }
            };
        }
    },
    getPriceAdjustments() {
        return this.priceAdjustments
    },
    getTotalTax() {
        return {
            value: 6.66,
            currencyCode: 'USD',
            isAvailable: () => {
                return true
            }
        }
    },
    getTotalGrossPrice() {
        return {
            value: 9.66,
            currencyCode: 'USD',
            isAvailable: () => {
                return true
            }
        }
    },
    createBillingAddress() {
      return {
        setFirstName() {},
        setLastName() {},
        setAddress1() {},
        setAddress2() {},
        setCity() {},
        setPostalCode() {},
        setStateCode() {},
        setCountryCode() {},
        setPhone() {},
      };
    },
    shippingTotalPrice: {
      subtract() {
        return { value: 0 };
      },
    },
    paymentInstruments: PaymentMgr.paymentInstruments
  };
}

module.exports = {
  getCurrentBasket: getCurrentBasket,
  getCurrentOrNewBasket: getCurrentBasket,
};
