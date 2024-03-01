'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var BasketMgr = require('dw/order/BasketMgr');

const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

server.append('Confirm',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var currentBasket = BasketMgr.getCurrentBasket();
        var shoppayApplicable = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);
        res.viewData.includeShopPayJS = shoppayGlobalRefs.shoppayElementsApplicable('checkout') && shoppayApplicable;
        res.viewData.shoppayClientRefs = res.viewData.includeShopPayJS
        ? JSON.stringify(shoppayGlobalRefs.getClientRefs('checkout'))
        : JSON.stringify({});
    return next();
});

module.exports = server.exports();
