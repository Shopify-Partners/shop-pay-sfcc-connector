'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var StringUtils = require('dw/util/StringUtils');
var abTestHelpers = require('*/cartridge/scripts/shoppay/helpers/abTestHelpers');

server.append('BeginSession', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var shoppayABCookie = request.httpCookies['shoppayAB'];
    var viewData = res.getViewData();

    if(shoppayABCookie && shoppayABCookie.value !== '{}') {
        var shoppayABCookieValue = abTestHelpers.decodeString(shoppayABCookie.value);
        shoppayABCookieValue['st'] = viewData.token;
        shoppayABCookie.setValue(abTestHelpers.encodeObject(shoppayABCookieValue));
        response.addHttpCookie(shoppayABCookie);
    }
    
    next();
});

module.exports = server.exports();