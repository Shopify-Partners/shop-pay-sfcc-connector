'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

/* Middleware */
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/* Script Modules */
const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/* API Includes */
var BasketMgr = require('dw/order/BasketMgr');


server.append('Show', csrfProtection.generateToken, function (req, res, next) {
    var product = res.viewData.product;
    if (product.productType === 'set') {
        return next();
    }

    res.viewData.includeShopPayJS = shoppayGlobalRefs.shoppayElementsApplicable('pdp', res.viewData.product.id);
    var currentBasket = BasketMgr.getCurrentBasket();
    var isEmptyCart = false;
    if (!currentBasket
        || (currentBasket.productLineItems.length == 0 && currentBasket.giftCertificateLineItems.length == 0)
    ) {
        isEmptyCart = true;
    }
    res.viewData.isEmptyCart = isEmptyCart;

    res.viewData.shoppayClientRefs = JSON.stringify(shoppayGlobalRefs.getClientRefs('pdp', res.viewData.product.id));
    if (product.readyToOrder) {
        var buyNowInitData = {
            pid: product.id,
            quantity: product.selectedQuantity
        };
        if (product.options) {
            var options = [];
            product.options.forEach(function(option) {
                options.push({
                    id: option.id,
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
        res.viewData.buyNowInitData = JSON.stringify(buyNowInitData);
    }

    next();
});


server.append('Variation', function (req, res, next) {
    var shoppayCheckoutHelpers = require('*/cartridge/scripts/shoppay/helpers/shoppayCheckoutHelpers');
    var viewData = res.getViewData();
    var product = viewData.product;

    var buyNowProduct = {
        pid: product.id,
        quantity: product.selectedQuantity
    };
    if (product.options) {
        var options = [];
        product.options.forEach(function(option) {
            options.push({
                id: option.id,
                selectedValueId: option.selectedValueId
            })
        });
        buyNowProduct.options = options;
    }
    if (product.bundledProducts) {
        var bundlePids = [];
        product.bundledProducts.forEach(function(bundledProduct) {
            bundlePids.push({
                pid: bundledProduct.id,
                quantity: bundledProduct.selectedQuantity
            });
        });
        buyNowProduct.childProducts = bundlePids;
    }

    var buyNowPaymentRequest = shoppayCheckoutHelpers.getBuyNowData(buyNowProduct);

    viewData.product.buyNow = buyNowPaymentRequest;
    res.setViewData(viewData);

    next();
});


module.exports = server.exports();
