'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

/* Middleware */
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/* Script Modules */
var abTestHelpers = require('*/cartridge/scripts/shoppay/helpers/abTestHelpers');
const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

/* API Includes */
var BasketMgr = require('dw/order/BasketMgr');
var Cookie = require('dw/web/Cookie');


server.append('Begin', csrfProtection.generateToken, function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shoppayABCookie = request.httpCookies['shoppayAB'];
    var shoppayApplicable = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);

    //If there is no cookie create it else do nothing
    if(!shoppayABCookie || shoppayABCookie.value === '{}') {
        var shoppayABCookie = new Cookie(
            'shoppayAB',
            JSON.stringify({
                subjectId: session.customer.getID(),
                assignmentGroup: abTestHelpers.getAssignmentGroup(shoppayApplicable)
            })
        );
        //set cookie to expire in 90 days
        shoppayABCookie.setMaxAge(7776000);
        response.addHttpCookie(shoppayABCookie);
    }

    next();
});

module.exports = server.exports();
