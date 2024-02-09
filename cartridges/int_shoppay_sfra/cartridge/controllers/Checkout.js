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
server.append('Begin', csrfProtection.generateToken, function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shoppayApplicable = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);
    // // =================================== FROM POC PR - STILL NEEDED ?????? ===================================
    // res.viewData.shoppayClientRefs = JSON.stringify(shoppayGlobalRefs.getClientRefs('checkout'));
    // // =========================================================================================================
    res.viewData.includeShopPayJS = shoppayGlobalRefs.shoppayElementsApplicable('checkout') && shoppayApplicable;
    res.viewData.shoppayClientRefs = res.viewData.includeShopPayJS
        ? JSON.stringify(shoppayGlobalRefs.getClientRefs(true))
        : JSON.stringify({});
    next();
});

module.exports = server.exports();
