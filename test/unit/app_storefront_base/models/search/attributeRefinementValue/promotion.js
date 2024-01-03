'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();


describe('PromotionAttributeValue model', function () {
    var refinementDefinition = {};
    var promotionAttributeValue = {};

    var PromotionAttributeValue = proxyquire('../../../../../../cartridges/app_storefront_base/cartridge/models/search/attributeRefinementValue/promotion', {
        '*/cartridge/models/search/attributeRefinementValue/base': proxyquire(
            '../../../../../../cartridges/app_storefront_base/cartridge/models/search/attributeRefinementValue/base', {
                'dw/web/Resource': {
                    msgf: function () { return 'some product title'; }
                }
            }
        ),
        'dw/web/Resource': {
            msg: function () { return 'some display value'; }
        }
    });

    var productSearch = {
        isRefinedByPromotion: function () { return true; },
        urlRefinePromotion: function () {
            return {
                relative: function () {
                    return {
                        toString: function () { return 'select url'; }
                    };
                }
            };
        },
        urlRelaxPromotion: function () {
            return {
                relative: function () {
                    return {
                        toString: function () { return 'relax url'; }
                    };
                }
            };
        }
    };
    var refinementValue = {
        ID: 'product 1',
        presentationID: 'prez',
        value: 'some value',
        displayValue: 'some display value',
        hitCount: 10
    };

    it('should instantiate a Promotion Attribute Value model', function () {
        promotionAttributeValue = new PromotionAttributeValue(productSearch, refinementDefinition, refinementValue);

        assert.deepEqual(promotionAttributeValue, {
            id: 'product 1',
            type: 'promotion',
            displayValue: 'some display value',
            selected: true,
            selectable: true,
            title: 'some product title',
            url: 'relax url'
        });
    });

    it('should instantiate a unselected Promotion Attribute Value model', function () {
        productSearch.isRefinedByPromotion = function () { return false; };
        promotionAttributeValue = new PromotionAttributeValue(productSearch, refinementDefinition, refinementValue);

        assert.deepEqual(promotionAttributeValue, {
            id: 'product 1',
            type: 'promotion',
            displayValue: 'some display value',
            selected: false,
            selectable: true,
            title: 'some product title',
            url: 'select url'
        });
    });

    it('should instantiate a unselectable Promotion Attribute Value model', function () {
        productSearch.isRefinedByPromotion = function () { return false; };
        refinementValue.hitCount = 0;
        promotionAttributeValue = new PromotionAttributeValue(productSearch, refinementDefinition, refinementValue);

        assert.deepEqual(promotionAttributeValue, {
            id: 'product 1',
            type: 'promotion',
            displayValue: 'some display value',
            selected: false,
            selectable: false,
            title: 'some product title',
            url: '#'
        });
    });
});
