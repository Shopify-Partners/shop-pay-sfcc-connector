'use strict';


var pricingHelper = require('*/cartridge/scripts/helpers/pricing');
var DefaultPrice = require('*/cartridge/models/price/default');
var RangePrice = require('*/cartridge/models/price/range');

module.exports = function (object, searchHit, activePromotions, getSearchHit) {
    Object.defineProperty(object, 'price', {
        enumerable: true,
        value: (function () {
            var salePrice = { minPrice: searchHit.minPrice, maxPrice: searchHit.maxPrice };
            var promotions = pricingHelper.getPromotions(searchHit, activePromotions);
            if (promotions.getLength() > 0) {
                var promotionalPrice = pricingHelper.getPromotionPrice(searchHit.firstRepresentedProduct, promotions);
                if (promotionalPrice && promotionalPrice.available) {
                    salePrice = { minPrice: promotionalPrice, maxPrice: promotionalPrice };
                }
            }
            var listPrice = pricingHelper.getListPrices(searchHit, getSearchHit);

            if (salePrice.minPrice.value !== salePrice.maxPrice.value) {
                // range price
                return new RangePrice(salePrice.minPrice, salePrice.maxPrice);
            }

            if (listPrice.minPrice && listPrice.minPrice.valueOrNull !== null) {
                if (listPrice.minPrice.value !== salePrice.minPrice.value) {
                    return new DefaultPrice(salePrice.minPrice, listPrice.minPrice);
                }
            }
            return new DefaultPrice(salePrice.minPrice);
        }())
    });
};
