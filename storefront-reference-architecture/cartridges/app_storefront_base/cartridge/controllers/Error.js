'use strict';

/**
 * @namespace Error
 */

var server = require('server');
var system = require('dw/system/System');
var Resource = require('dw/web/Resource');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

/**
 * Error-Start : This endpoint is called when there is a server error
 * @name Base/Error-Start
 * @function
 * @memberof Error
 * @param {middleware} - consentTracking.consent
 * @param {httpparameter} - error - message to be displayed
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get/post
 */
server.use('Start', consentTracking.consent, function (req, res, next) {
    res.setStatusCode(500);
    var showError = system.getInstanceType() !== system.PRODUCTION_SYSTEM
        && system.getInstanceType() !== system.STAGING_SYSTEM;
    if (req.httpHeaders.get('x-requested-with') === 'XMLHttpRequest') {
        res.json({
            error: showError ? req.error || {} : {},
            message: Resource.msg('subheading.error.general', 'error', null)
        });
    } else {
        res.render('error', {
            error: req.error || {},
            showError: showError,
            message: Resource.msg('subheading.error.general', 'error', null)
        });
    }
    next();
});

/**
 * Error-ErrorCode : This endpoint can be called to display an error from a resource file
 * @name Base/Error-ErrorCode
 * @function
 * @memberof Error
 * @param {middleware} - consentTracking.consent
 * @param {httpparameter} - err - e.g 01 (Error Code mapped in the resource file appended with 'message.error.')
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get/post
 */
server.use('ErrorCode', consentTracking.consent, function (req, res, next) {
    res.setStatusCode(500);
    var errorMessage = 'message.error.' + req.querystring.err;

    res.render('error', {
        error: req.error || {},
        message: Resource.msg(errorMessage, 'error', null)
    });
    next();
});

/**
 * Error-Forbidden : This endpoint is called when a shopper tries to access a forbidden content. The shopper is logged out and the browser is redirected to the home page
 * @name Base/Error-Forbidden
 * @function
 * @memberof Error
 * @param {middleware} - consentTracking.consent
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('Forbidden', consentTracking.consent, function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var CustomerMgr = require('dw/customer/CustomerMgr');

    CustomerMgr.logoutCustomer(true);
    res.redirect(URLUtils.url('Home-Show'));
    next();
});

module.exports = server.exports();
