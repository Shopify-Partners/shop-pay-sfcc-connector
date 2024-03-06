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
var currentSite = require('dw/system/Site').current;
var StringUtils = require('dw/util/StringUtils');

server.append('Begin', csrfProtection.generateToken, function (req, res, next) {
    var activeABTest;
    var activeAssignmentGroup;
    var currentBasket = BasketMgr.getCurrentBasket();
    var shoppayABCookie = request.httpCookies['shoppayAB'];
    var shoppayApplicable = shoppayGlobalRefs.shoppayApplicable(req, currentBasket);
    var viewData = res.getViewData();

    //If there is no cookie create it else do nothing
    if(!shoppayABCookie || shoppayABCookie.value === '{}') {
        var assignmentObject = abTestHelpers.getAssignmentGroup(shoppayApplicable);
        var { abTest, assignmentGroup } = assignmentObject;
        abTestHelpers.createShopPayABCookie({
            subjectId: session.customer.getID(),
            abTest: abTest,
            assignmentGroup: assignmentGroup
        });
        activeABTest = abTest;
        activeAssignmentGroup = assignmentGroup;
    } else {
        var shoppayABCookieValue = abTestHelpers.decodeString(shoppayABCookie.value);
        activeABTest = shoppayABCookieValue.abTest;
        activeAssignmentGroup = shoppayABCookieValue.assignmentGroup;
    }

    //The ShopPay SDK should alaways be added for A/A or A/B test so we can send tracking events
    viewData.includeShopPayJS = true;
    var shoppayClientRefs = JSON.parse(viewData.shoppayClientRefs);
    var shoppayExperimentId = currentSite.getCustomPreferenceValue('shoppayExperimentId');
    if(shoppayExperimentId) {
        shoppayClientRefs['constants']['shoppayExperimentId'] = shoppayExperimentId;
        viewData.shoppayClientRefs = viewData.includeShopPayJS
            ? JSON.stringify(shoppayClientRefs)
            : JSON.stringify({});
    }
    if (activeABTest == 'shoppayAA') {
        shoppayClientRefs['preferences']['shoppayAATest'] = true;
    }

    if(activeABTest === 'shoppayAA' || activeAssignmentGroup === 'control') {
       viewData.hideCheckoutShoppayButton = true;
    }

    viewData.initShopPayABTest = true;
    res.setViewData(viewData);

    next();
});

module.exports = server.exports();
