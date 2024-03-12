'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

/* Middleware */
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/* Script Modules */
const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/* API Includes */
var BasketMgr = require('dw/order/BasketMgr');

server.append('Confirm',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var currentBasket = BasketMgr.getCurrentBasket();
        res.viewData.includeShopPayJS = true;
        res.viewData.shoppayClientRefs = res.viewData.includeShopPayJS
        ? JSON.stringify(shoppayGlobalRefs.getClientRefs('checkout'))
        : JSON.stringify({});
    return next();
});

module.exports = server.exports();
