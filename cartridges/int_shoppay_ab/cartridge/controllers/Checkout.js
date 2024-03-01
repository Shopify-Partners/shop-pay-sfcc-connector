'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var BasketMgr = require('dw/order/BasketMgr');
var StringUtils = require('dw/util/StringUtils');
var currentSite = require('dw/system/Site').current;
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

    viewData.includeShopPayJS = activeABTest !== 'shoppayAA' && activeAssignmentGroup === 'treatment';
    var shoppayClientRefs = JSON.parse(viewData.shoppayClientRefs);
    var experimentId = currentSite.getCustomPreferenceValue('experimentId');
    if(experimentId) {
        shoppayClientRefs['constants']['experimentId'] = experimentId;
        viewData.shoppayClientRefs = viewData.includeShopPayJS
            ? JSON.stringify(shoppayClientRefs)
            : JSON.stringify({});
    }

    viewData.intABTest = true;
    res.setViewData(viewData);

    next();
});

module.exports = server.exports();
