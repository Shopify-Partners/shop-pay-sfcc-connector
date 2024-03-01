'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

/* Middleware */
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/* Script Modules */
var abTestHelpers = require('*/cartridge/scripts/shoppay/helpers/abTestHelpers');

/* API Includes */
var StringUtils = require('dw/util/StringUtils');

server.append('BeginSession', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    var shoppayABCookie = request.httpCookies['shoppayAB'];
    var viewData = res.getViewData();

    if(shoppayABCookie && shoppayABCookie.value !== '{}') {
        var shoppayABCookieValue = abTestHelpers.decodeString(shoppayABCookie.value);
        shoppayABCookieValue['st'] = viewData.token;
        shoppayABCookie.setValue(abTestHelpers.encodeObject(shoppayABCookieValue));
        response.addHttpCookie(shoppayABCookie);
    }
    
    var mytest2 = JSON.stringify({'name': 'kristin', 'reg': 'true'});
    var myCookie = request.httpCookies['__sp1'];
    if(myCookie) {
        myCookie.setValue(dw.util.StringUtils.encodeBase64(mytest2));
        response.addHttpCookie(myCookie);
    }

    next();
});

module.exports = server.exports();