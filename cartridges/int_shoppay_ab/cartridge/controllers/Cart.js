'use strict';

const page = module.superModule;
const server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var ABTestMgr = require('dw/campaign/ABTestMgr');
var Cookie = require('dw/web/Cookie');

var abTestHelpers = require('*/cartridge/scripts/shoppay/helpers/abTestHelpers');

server.append('Show', csrfProtection.generateToken, function (req, res, next) {
    var shoppayCookie = request.httpCookies['shoppayCookie'];
    var segment;

    if(!shoppayCookie || shoppayCookie.value === '{}') {
        var shoppayCookie = new Cookie(
            'shoppayCookie',
            JSON.stringify({
                subjectId: session.customer.getID(),
                assignmentGroup: abTestHelpers.getAssignmentGroup()
            })
        );
        response.addHttpCookie(shoppayCookie);
    } else {
        var cookieObject = JSON.parse(shoppayCookie.value);
        segment = cookieObject.assignmentGroup;
    }
    next();
});

module.exports = server.exports();
