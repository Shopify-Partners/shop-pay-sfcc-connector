'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var ArrayList = require('../../../../../mocks/dw.util.Collection');

var stubRangePrice = sinon.stub();
var stubDefaultPrice = sinon.stub();
var stubListPrices = sinon.stub();


var searchHitMock = {
    minPrice: { value: 100, available: true },
    maxPrice: { value: 100, available: true },
    discountedPromotionIDs: ['someID']
};

var noActivePromotionsMock = [];
var activePromotionsMock = ['someID'];
var activePromotionsNoMatchMock = [];

function getSearchHit() {
    return searchHitMock;
}

describe('search price decorator', function () {
    var searchPrice = proxyquire('../../../../../../cartridges/app_storefront_base/cartridge/models/product/decorators/searchPrice', {
        '*/cartridge/scripts/helpers/pricing': {
            getPromotionPrice: function () { return { value: 50, available: true }; },
            getPromotions: function (searchHit, activePromotions) { return new ArrayList(activePromotions); },
            getListPrices: stubListPrices
        },
        '*/cartridge/models/price/default': stubDefaultPrice,
        '*/cartridge/models/price/range': stubRangePrice
    });

    afterEach(function () {
        stubRangePrice.reset();
        stubDefaultPrice.reset();
        stubListPrices.reset();
    });

    it('should create a property on the passed in object called price with no active promotions', function () {
        var object = {};

        stubListPrices.returns({
            minPrice: { value: 100, available: true },
            maxPrice: { value: 100, available: true }
        });

        searchPrice(object, searchHitMock, noActivePromotionsMock, getSearchHit);

        assert.isTrue(stubDefaultPrice.withArgs({ value: 100, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price when there are active promotion but they do not match', function () {
        var object = {};

        searchPrice(object, searchHitMock, activePromotionsNoMatchMock, getSearchHit);

        assert.isTrue(stubDefaultPrice.withArgs({ value: 100, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price when there active promotions that do match', function () {
        var object = {};

        searchPrice(object, searchHitMock, activePromotionsMock, getSearchHit);

        assert.isTrue(stubDefaultPrice.withArgs({ value: 50, available: true }, { value: 100, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price', function () {
        var object = {};

        searchPrice(object, searchHitMock, activePromotionsMock, getSearchHit);

        assert.isTrue(stubDefaultPrice.withArgs({ value: 50, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price', function () {
        var object = {};

        searchPrice(object, searchHitMock, activePromotionsMock, getSearchHit);

        assert.isTrue(stubDefaultPrice.withArgs({ value: 50, available: true }, { value: 100, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price', function () {
        var object = {};

        searchHitMock.maxPrice.value = 200;
        searchPrice(object, searchHitMock, noActivePromotionsMock, getSearchHit);

        assert.isTrue(stubRangePrice.withArgs({ value: 100, available: true }, { value: 200, available: true }).calledOnce);
    });
});
