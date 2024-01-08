'use strict';

/**
 * @namespace ConsentTracking
 */

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * ConsentTracking-SetSession : DEPRECATED - Replaced by ConsentTracking-SetConsent, which includes CSRF protection
 * @name Base/ConsentTracking-SetSession
 * @function
 * @memberof ConsentTracking
 * @deprecated
 * @param {querystringparameter} - consent -  The value of this is a boolean. If the boolean value is true, tracking is enabled for the current session; if false, tracking is disabled
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('SetSession', function (req, res, next) {
    var consent = (req.querystring.consent === 'true');
    req.session.raw.setTrackingAllowed(consent);
    req.session.privacyCache.set('consent', consent);
    res.json({ success: true });
    next();
});

/**
 * ConsentTracking-SetConsent : This endpoint is called when the shopper agrees/disagrees to tracking consent
 * @name Base/ConsentTracking-SetConsent
 * @function
 * @memberof ConsentTracking
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.validateAjaxRequest
 * @param {querystringparameter} - consent - If set to true, tracking is enabled for the current session, otherwise tracking is disabled
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.post(
    'SetConsent',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var consent = (req.querystring.consent === 'true');
        req.session.raw.setTrackingAllowed(consent);
        req.session.privacyCache.set('consent', consent);
        res.json({ success: true });
        next();
    });

/**
 * ConsentTracking-GetContent : This endpoint is called to load the consent tracking content
 * @name Base/ConsentTracking-GetContent
 * @function
 * @memberof ConsentTracking
 * @param {querystringparameter} - cid -  The value of this is a string. This is the internal ID of the content asset used for consent message
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('GetContent', function (req, res, next) {
    var ContentMgr = require('dw/content/ContentMgr');
    var ContentModel = require('*/cartridge/models/content');

    var apiContent = ContentMgr.getContent(req.querystring.cid);

    if (apiContent) {
        var content = new ContentModel(apiContent, 'components/content/contentAssetInc');
        if (content.template) {
            res.render(content.template, { content: content });
        }
    }
    next();
});

/**
 * ConsentTracking-Check : This endpoint is called every time a storefront page is rendered
 * @name Base/ConsentTracking-Check
 * @function
 * @memberof ConsentTracking
 * @param {middleware} - consentTracking.consent
 * @param {category} - sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Check', consentTracking.consent, function (req, res, next) {
    var ContentMgr = require('dw/content/ContentMgr');
    var content = ContentMgr.getContent('tracking_hint');
    res.render('/common/consent', {
        consentApi: Object.prototype.hasOwnProperty.call(req.session.raw, 'setTrackingAllowed'),
        caOnline: content.online
    });
    next();
});

module.exports = server.exports();
