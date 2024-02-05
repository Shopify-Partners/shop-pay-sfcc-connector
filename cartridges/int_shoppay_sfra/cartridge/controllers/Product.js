'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var BasketMgr = require('dw/order/BasketMgr');

const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/**
 * Kristin TODO: Build out and reference conditional logic helper script to set the value of includeShopPayJS
 */
server.append('Show', csrfProtection.generateToken, function (req, res, next) {
    res.viewData.includeShopPayJS = shoppayGlobalRefs.shoppayElementsApplicable('pdp');
    res.viewData.shoppayClientRefs = JSON.stringify(shoppayGlobalRefs.getClientRefs());
    var currentBasket = BasketMgr.getCurrentBasket();
    var isEmptyCart = false;
    if (!currentBasket
        || (currentBasket.productLineItems.length == 0 && currentBasket.giftCertificateLineItems.length == 0)
    ) {
        isEmptyCart = true;
    }
    res.viewData.isEmptyCart = isEmptyCart;
    next();
});

module.exports = server.exports();
