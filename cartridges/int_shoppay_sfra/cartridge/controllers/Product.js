'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/**
 * Kristin TODO: Build out and reference conditional logic helper script to set the value of includeShopPayJS
 */
server.append('Show', csrfProtection.generateToken, function (req, res, next) {
    res.viewData.includeShopPayJS = shoppayGlobalRefs.shoppayElementsApplicable('pdp');
    res.viewData.shoppayClientRefs = JSON.stringify(shoppayGlobalRefs.getClientRefs('pdp'));
    next();
});

server.append('Variation', function (req, res, next) {
    var shoppayCheckoutHelpers = require('*/cartridge/scripts/shoppay/helpers/shoppayCheckoutHelpers');
    var viewData = res.getViewData();
    var product = viewData.product;

    var buyNowPaymentRequest = shoppayCheckoutHelpers.getBuyNowData(product.id, product.selectedQuantity, product.options);

    viewData.product.buyNow = buyNowPaymentRequest;
    res.setViewData(viewData);

    next();
});

module.exports = server.exports();
