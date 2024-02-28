'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var BasketMgr = require('dw/order/BasketMgr');
var Cookie = require('dw/web/Cookie');
var StringUtils = require('dw/util/StringUtils');

const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');
var abTestHelpers = require('*/cartridge/scripts/shoppay/helpers/abTestHelpers');

server.append('Begin', csrfProtection.generateToken, function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var shoppayABCookie = request.httpCookies['shoppayAB'];
    var shoppayApplicable = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);
    var viewData = res.getViewData();
    var activeABTest;
    var activeAssignmentGroup;

    //If there is no cookie create it else do nothing
    if(!shoppayABCookie || shoppayABCookie.value === '{}') {
        var assignmentObject = abTestHelpers.getAssignmentGroup(shoppayApplicable);
        var { abTest, assignmentGroup } = assignmentObject;
        var shoppayABCookie = new Cookie(
            'shoppayAB',
            //the string is encoded to base64 to ensure the cookie JSON string keeps
            // the correct struture
            StringUtils.encodeBase64(
                JSON.stringify({
                    subjectId: session.customer.getID(),
                    abTest: abTest,
                    assignmentGroup: assignmentGroup
                })
            )
        );
        //set cookie to expire in 90 days
        shoppayABCookie.setMaxAge(7776000);
        response.addHttpCookie(shoppayABCookie);
        activeABTest = abTest;
        activeAssignmentGroup = assignmentGroup;
    } else {
        var shoppayABCookieValue = JSON.parse(
            StringUtils.decodeBase64(shoppayABCookie.value)
        );
        activeABTest = shoppayABCookieValue.abTest;
        activeAssignmentGroup = shoppayABCookieValue.assignmentGroup;
    }

    viewData.includeShopPayJS = activeABTest !== 'shoppayAA' && activeAssignmentGroup === 'treatment';
    viewData.intABTest = true;
    res.setViewData(viewData);

    next();
});

module.exports = server.exports();
