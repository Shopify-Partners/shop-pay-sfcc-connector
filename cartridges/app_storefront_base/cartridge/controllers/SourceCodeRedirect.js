'use strict';

/**
 * @namespace SourceCodeRedirect
 */

var server = require('server');
var URLUtils = require('dw/web/URLUtils');

/**
 * SourceCodeRedirect-Start : This endpoint allows the shopper to forward calls to other endpoints that is predefined in the business manager and redirect to a different page. An example will be forward to Link-Product or Link-Category endpoint based on the query parameter a shopper has provided
 * @name Base/SourceCodeRedirect-Start
 * @function
 * @memberof SourceCodeRedirect
 * @param {querystringparameter} - src - the redirect source id, for example 'privacy3' (note, this id needs to be configured in ECOM BM)
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('Start', function (req, res, next) {
    var sourceCodeRedirectURL = session.sourceCodeInfo.redirect; // eslint-disable-line no-undef
    if (sourceCodeRedirectURL) {
        res.redirect(sourceCodeRedirectURL.location);
    } else {
        res.redirect(URLUtils.url('Home-Show'));
    }

    next();
});

module.exports = server.exports();
