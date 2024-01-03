var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var structuredDataHelper = proxyquire(
    '../../../../../cartridges/app_storefront_base/cartridge/scripts/helpers/structuredDataHelper', {
        'dw/web/URLUtils': {
            url: function () { return 'some url'; },
            abs: function () { return 'abs url'; }
        },
        'dw/web/Resource': {
            msg: function () {
                return 'some string';
            }
        }
    });

describe('structured data helpers', function () {
    describe('get schema data', function () {
        var product = {
            productName: 'some name',
            id: '1234',
            shortDescription: 'short description',
            brand: 'brand',
            available: true,
            images: {
                large: [{
                    url: '/path',
                    absURL: 'full/path'
                },
                {
                    url: '/path1',
                    absURL: 'full/path1'
                }]
            },
            price: {
                type: 'range',
                currency: 'USD',
                min: '1.00',
                max: '5.00'
            }
        };

        it('should return basic information', function () {
            var schema = structuredDataHelper.getProductSchema(product);
            assert.equal(schema.name, 'some name');
            assert.equal(schema.image[0], 'full/path');
            assert.isDefined(schema.offers.availability);
        });

        it('should return offer', function () {
            product.price = {
                sales: {
                    currency: 'USD',
                    decimalPrice: '1.0'
                }
            };
            product.available = false;
            var schema = structuredDataHelper.getProductSchema(product);
            assert.equal(schema.offers.price, '1.0');
            assert.isDefined(schema.offers.availability);
        });

        it('should return sales price', function () {
            product.price = {
                list: {
                    currency: 'USD',
                    decimalPrice: '12.0'
                }
            };
            product.availability = {
                messages: []
            };
            product.available = true;
            product.availability.messages.push('some string');
            var schema = structuredDataHelper.getProductSchema(product);
            assert.equal(schema.offers.price, '12.0');
            assert.isDefined(schema.offers.availability);
            assert.equal(schema.offers.availability, 'http://schema.org/PreOrder');
        });
    });

    describe('get listing page data', function () {
        it('should return basic information', function () {
            var productIds = [{ productID: '1212' }, { productID: '1234' }];
            var schema = structuredDataHelper.getListingPageSchema(productIds);
            assert.isDefined(schema);
        });
    });
});
