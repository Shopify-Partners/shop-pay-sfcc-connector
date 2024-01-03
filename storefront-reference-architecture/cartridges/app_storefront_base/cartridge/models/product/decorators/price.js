'use strict';

var priceFactory = require('*/cartridge/scripts/factories/price');
var priceHelper = require('*/cartridge/scripts/helpers/pricing');

/**
  * Renders pricing template for line item
  * @param {Object} price - Factory price
  * @return {string} - Rendered HTML
  */
function getRenderedPrice(price) {
    var context = {
        price: price
    };
    return priceHelper.renderHtml(priceHelper.getHtmlContext(context));
}
module.exports = function (object, product, promotions, useSimplePrice, currentOptions) {
    Object.defineProperty(object, 'price', {
        enumerable: true,
        value: priceFactory.getPrice(product, null, useSimplePrice, promotions, currentOptions)
    });
    Object.defineProperty(object, 'renderedPrice', {
        enumerable: true,
        value: getRenderedPrice(object.price)
    });
};
