'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

var productFactoryMock = {
    productSetProducts: {
        length: 2
    }
};

describe(' productSetProducts decorator', function () {
    var numberOfProductsInSet = proxyquire('../../../../../../cartridges/app_storefront_base/cartridge/models/product/decorators/setProductsCollection', {
    });

    it('should create a property on the passed in object called numberOfProductsInSet', function () {
        var object = {};
        numberOfProductsInSet(object, productFactoryMock);
        assert.equal(object.numberOfProductsInSet, 2);
    });
});
