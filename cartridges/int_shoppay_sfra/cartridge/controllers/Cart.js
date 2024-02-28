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

/**
 * Kristin TODO: Build out and reference conditional logic helper script to set the value of includeShopPayJS
 */
server.append('Show', csrfProtection.generateToken, function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shoppayApplicable = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);
    res.viewData.includeShopPayJS = shoppayGlobalRefs.shoppayElementsApplicable('cart') && shoppayApplicable;
    res.viewData.shoppayClientRefs = res.viewData.includeShopPayJS
        ? JSON.stringify(shoppayGlobalRefs.getClientRefs('cart'))
        : JSON.stringify({});
    next();
});

module.exports = server.exports();
