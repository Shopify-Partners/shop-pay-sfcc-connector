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
    var product = res.viewData.product;
    if (product.readyToOrder) {
        var buyNowInitData = {
            pid: product.id,
            pidsObj: [],
            quantity: product.selectedQuantity
        };
        if (product.options) {
            var options = [];
            product.options.forEach(function(option) {
                options.push({
                    optionId: option.id,
                    selectedValueId: option.selectedValueId
                })
            });
            buyNowInitData.options = options;
        }
        if (product.bundledProducts) {
            var bundlePids = [];
            product.bundledProducts.forEach(function(bundledProduct) {
                bundlePids.push({
                    pid: bundledProduct.id,
                    quantity: bundledProduct.selectedQuantity
                });
            });
            buyNowInitData.childProducts = bundlePids;
        }
        if (product.individualProducts) {
            var pidsObj = [];
            product.individualProducts.forEach(function(setProduct){
                var setProductOptions = [];
                setProduct.options.forEach(function(option) {
                    setProductOptions.push({
                        optionId: option.id,
                        selectedValueId: option.selectedValueId
                    });
                });
                pidsObj.push({
                    pid: setProduct.id,
                    options: setProductOptions,
                    quantity: setProduct.selectedQuantity
                });
            });
            buyNowInitData.pidsObj = pidsObj;
        }
        res.viewData.buyNowInitData = JSON.stringify(buyNowInitData);
    }
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
