'use strict';

/**
 * @namespace Link
 */

var server = require('server');
var URLUtils = require('dw/web/URLUtils');

/**
 * Link-Page : This endpoint is called when a sourcecode redirect has an input parameter of content id
 * @name Base/Link-Page
 * @function
 * @memberof Link
 * @param {querystringparameter} - cid : content id, for example 'privacy3' (note, this id needs to be configured in ECOM BM)
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('Page', function (req, res, next) {
    var redirectUrl = URLUtils.url('Page-Show').toString() + '?' + req.querystring.toString();
    res.redirect(redirectUrl);
    next();
});

/**
 * Link-Category : This endpoint is called when a sourcecode redirect has an input parameter of category id
 * @name Base/Link-Category
 * @function
 * @memberof Link
 * @param {querystringparameter} - pid: product id, for example 'ps3bundle5' (note, this id needs to be configured in ECOM BM)
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('Category', function (req, res, next) {
    var redirectUrl = URLUtils.url('Search-Show').toString() + '?' + req.querystring.toString();
    res.redirect(redirectUrl);
    next();
});

/**
 * Link-Product : This endpoint is called when a sourcecode redirect has an input parameter product id
 * @name Base/Link-Product
 * @function
 * @memberof Link
 * @param {querystringparameter} - pid: product id, for example 'ps3bundle5' (note, this id needs to be configured in ECOM BM)
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('Product', function (req, res, next) {
    var redirectUrl = URLUtils.url('Product-Show').toString() + '?' + req.querystring.toString();
    res.redirect(redirectUrl);
    next();
});

/**
 * Link-CategoryProduct : This pipeline, which forwards calls to other pipelines, supports legacy code where content assets link to specific pipelines. For new code, link to the respective pipeline directly (for example, Search-Show or Product-Show). You can also create links within content assets directly in Business Manager"
 * @name Base/Link-CategoryProduct
 * @function
 * @memberof Link
 * @param {querystringparameter} - pid: product id, for example 'ps3bundle5' (note, this id needs to be configured in ECOM BM)
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('CategoryProduct', function (req, res, next) {
    var redirectUrl = URLUtils.url('Product-Show').toString() + '?' + req.querystring.toString();
    res.redirect(redirectUrl);
    next();
});

module.exports = server.exports();
