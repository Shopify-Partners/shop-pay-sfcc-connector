'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * Kristin TODO: Build out and reference conditional logic helper script to set the value of includeShopPayJS
 */
server.append('Begin', csrfProtection.generateToken, function (req, res, next) {
    res.viewData.includeShopPayJS = shoppayGlobalRefs.shoppayApplicable();
    res.viewData.shoppayClientRefs = JSON.stringify(shoppayGlobalRefs.clientRefs);
    next();
});

module.exports = server.exports();
