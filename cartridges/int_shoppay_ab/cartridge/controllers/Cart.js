'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var ABTestMgr = require('dw/campaign/ABTestMgr');

const shoppayGlobalRefs = require('*/cartridge/scripts/shoppayGlobalRefs');

server.append('Show', csrfProtection.generateToken, function (req, res, next) {
    var activeSegents = ABTestMgr.assignedTestSegments();

    const segment = ABTestMgr.isParticipant('shoppay-aa', 'ShopPayAAControl') ? 'control' : ABTestMgr.isParticipant('shoppay-aa', 'ShopPayABTreatment') ? 'treatment' : undefined;
    var newShoppayClientRefs = JSON.parse(res.viewData.shoppayClientRefs);
    var newShoppayClientRefsConstants = newShoppayClientRefs['constants'];
    newShoppayClientRefsConstants['segment'] = segment;
    res.viewData.shoppayClientRefs = JSON.stringify(newShoppayClientRefs);
    res.viewData.segment = segment;
    next();
});

module.exports = server.exports();
