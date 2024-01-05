'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var renderHtmlStub = sinon.stub();
var getHtmlContextStub = sinon.stub();

describe('product price decorator', function () {
    var price = proxyquire('../../../../../../cartridges/app_storefront_base/cartridge/models/product/decorators/price', {
        '*/cartridge/scripts/factories/price': {
            getPrice: function () { return 'Product Price'; }
        },
        '../../../../../../cartridges/app_storefront_base/cartridge/models/product/decorators/price': {
            getRenderedPrice: function () { return 'Rendered Price'; }
        },
        '*/cartridge/scripts/helpers/pricing': {
            renderHtml: renderHtmlStub.returns('Rendered Price'),
            getHtmlContext: getHtmlContextStub
        }
    });

    it('should create a property on the passed in object called price', function () {
        var object = {};
        price(object, {}, {}, true, {});
        assert.equal(object.price, 'Product Price');
    });
    it('should create a property on the passed in object called renderedPrice', function () {
        var renderedObject = {};
        price(renderedObject);
        assert.equal(renderedObject.renderedPrice, 'Rendered Price');
    });
});
