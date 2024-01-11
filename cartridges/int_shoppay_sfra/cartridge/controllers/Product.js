'use strict';

const page = module.superModule;
const server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

server.extend(page);

/**
 * Kristin TODO: Build out and reference conditional logic helper script to set the value of includeShopPayJS
 */
server.append('Show', csrfProtection.generateToken, function (req, res, next) {
    res.viewData.includeShopPayJS = true;
    var shoppayEnabled = shoppayGlobalRefs.shoppayEnabled();
    var shoppayUrls = shoppayGlobalRefs.urls; // note this is a keyed object
    var SPGetCartSummaryURL = shoppayGlobalRefs.urls.GetCartSummary;
    next();
});

module.exports = server.exports();
