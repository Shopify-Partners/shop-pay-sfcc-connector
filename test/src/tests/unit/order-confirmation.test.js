/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const expect = require('chai').expect;
const path = require('path');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();
const Site = require('../mocks/dw.system.Site');
const StringUtils = require('../mocks/dw.util.StringUtils');
const Logger = require('../mocks/dw.system.Logger');
const URLUtils = require('../mocks/dw.web.URLUtils');
const ProductMgr = require('../mocks/dw.catalog.ProductMgr');
const BasketMgr = require('../mocks/BasketMgr');
const basketStubs = require('../mocks/util/basketObjectStubs');
require('app-module-path').addPath(path.join(process.cwd(), '../cartridges'));

global.empty = sinon.stub();
global.dw = {
    util: {
        StringUtils: {
            formatMoney: function () {
                return '$9.99';
            },
            formatCalendar: function () {
                return '2022-22-02';
            }
        },
        Calendar: function() {
            return '2022-22-02';
        }
    },
    value: {
        Money: function() {
            return '$9.00';
        }
    },
};

global.session = {
    getCurrency: function() {
        return {
            getCurrencyCode: function() {
                return 'USD';
            }
        };
    }
};

var server = {
    extend: function () {
        return {};
    },
    append: function () {
        return {};
    },
    exports: function () {
        return {};
    }
};

const basketManagerMock = new BasketMgr();

const orderConfirmationEvent = proxyquire('int_shoppay_sfra/cartridge/controllers/Checkout.js', {
    'dw/system/Site': Site,
    'dw/util/StringUtils': StringUtils,
    'dw/system/Logger': Logger,
    'dw/web/URLUtils': URLUtils,
    'dw/catalog/ProductMgr': ProductMgr,
    'server': server,
    '*/cartridge/scripts/middleware/csrf': {},
    '*/cartridge/scripts/shoppayGlobalRefs': {}
});

describe('orderConfirmation', () => {

    beforeEach(() => {
        global.empty.returns(false);
    });

    it('should return data for "Order Confirmation" results', () => {
        const expectedResult = {
            'Order Total': '$9.99',
            Tax: '$9.99',
            Subtotal: '$9.99',
            'Shipping Cost': '$9.99',
            Discount: '$9.99',
            'Order Number': '000101899',
            'Order Date': '2022-22-02',
            'Customer Number': 8575309,
            'Customer Name': 'John Snow',
            'Shipping Method': 'Ground',
            'Card Last Four Digits': '############',
            'Card Type': 'visa',
            'Promo Code': '',
            'Promotion ID': '',
            product_line_items: [
                {
                    'Product ID': 'NG3614270264405',
                    'Product Name': 'Belle de Teint',
                    'Product Secondary Name': '',
                    Quantity: 1,
                    Discount: 10,
                    'Product Page URL': 'https://production-sitegenesis-dw.demandware.net/s/RefArch/home?lang=en_US',
                    'Product Variant': '',
                    'Product Image URL': 'https://sforce.co/43Pig4s',
                    'Master Product ID': 'NG3614270264405',
                    Price: 96,
                    'Price Value': 1,
                    'Original Price': 100,
                    'Original Price Value': 99,
                    'Product Options': [{
                        'basePrice': {
                            'value': 0.99
                        },
                        'lineItemText': 'lineItemText1',
                        'optionID': 'optionId1',
                        'optionValueID': 'selectedValueId1',
                        'productName': 'productName1',
                    },
                    {
                        'basePrice': {
                            'value': 1.99
                        },
                        'lineItemText': 'lineItemText2',
                        'optionID': 'optionId2',
                        'optionValueID': 'selectedValueId2',
                        'productName': 'productName2',
                    }],
                    'Is Bonus Product': true,
                    'Is Product Bundle': true,
                    'Bundled Product IDs': [
                        'sony-ps3-consoleM',
                        'easports-nascar-09-ps3M',
                        'easports-monopoly-ps3M',
                        'namco-eternal-sonata-ps3M',
                        'sony-warhawk-ps3M'
                    ],
                }
            ],
            'Billing Address': [
                {
                    'First Name': 'Ricky',
                    'Last Name': 'Bobby',
                    Address1: '54321 First Last Lane',
                    Address2: '',
                    City: 'West Palm',
                    'Postal Code': '04330',
                    'State Code': 'FL',
                    'Country Code': 'US',
                    Phone: '011-235-8137'
                }
            ],
            'Shipping Address': [
                {
                    'First Name': 'The Muffin',
                    'Last Name': 'Man',
                    Address1: '1 Drury Lane',
                    Address2: '',
                    City: 'Far Far Away',
                    'Postal Code': '04330',
                    'State Code': 'ME',
                    'Country Code': 'US',
                    Phone: '333-333-3333'
                }
            ],
            'Manage Order URL': 'https://production-sitegenesis-dw.demandware.net/s/RefArch/home?lang=en_US',
            Items: [ 'NG3614270264405' ],
            'Item Count': 1,
            'Item Primary Categories': [ 'Skin Care' ],
            'Item Categories': [ 'Skin Care' ],
            '$value': 20,
            '$event_id': 'orderConfirmation-000101899',
            'Tracking Number': '999-999-999-9999999'
        };
    });
});
