'use strict';

/**
 * @namespace Stores
 */

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var storeHelpers = require('*/cartridge/scripts/helpers/storeHelpers');

/**
 * Stores-Find : This endpoint is used to load the Find Stores page
 * @name Base/Stores-Find
 * @function
 * @memberof Stores
 * @param {middleware} - server.middleware.https
 * @param {middleware} - cache.applyDefaultCache
 * @param {middleware} - consentTracking
 * @param {querystringparameter} - radius - The radius that the shopper selected to refine the search
 * @param {querystringparameter} - postalCode - The postal code that the shopper used to search
 * @param {querystringparameter} - lat - The latitude of the shopper position
 * @param {querystringparameter} - long - The longitude of the shopper position
 * @param {querystringparameter} - showMap - A flag indicating whether or not map is to be shown
 * @param {querystringparameter} - horizontalView - Boolean value to show map in Horizontal View
 * @param {querystringparameter} - isForm - Boolean value to show (or not) the form to Find Stores
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('Find', server.middleware.https, cache.applyDefaultCache, consentTracking.consent, function (req, res, next) {
    var radius = req.querystring.radius;
    var postalCode = req.querystring.postalCode;
    var lat = req.querystring.lat;
    var long = req.querystring.long;
    var showMap = req.querystring.showMap || false;
    var horizontalView = req.querystring.horizontalView || false;
    var isForm = req.querystring.isForm || false;

    var stores = storeHelpers.getStores(radius, postalCode, lat, long, req.geolocation, showMap);
    var viewData = {
        stores: stores,
        horizontalView: horizontalView,
        isForm: isForm,
        showMap: showMap
    };

    res.render('storeLocator/storeLocator', viewData);
    next();
});

// The req parameter in the unnamed callback function is a local instance of the request object.
// The req parameter has a property called querystring. In this use case the querystring could have the following: lat, long, radius, or postalCode, radius

/**
 * Stores-FindStores : The Stores-FindStores endpoint returns a list of stores that meet the searching criteria
 * @name Base/Stores-FindStores
 * @function
 * @memberof Stores
 * @param {querystringparameter} - radius - The radius that the shopper selected to refine the search
 * @param {querystringparameter} - postalCode - The postal code that the shopper used to search
 * @param {querystringparameter} - lat - The latitude of the shopper position
 * @param {querystringparameter} - long - The longitude of the shopper position
 * @param {querystringparameter} - showMap - A flag indicating whether or not map is to be shown
 * @param {category} - non-sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('FindStores', function (req, res, next) {
    var radius = req.querystring.radius;
    var postalCode = req.querystring.postalCode;
    var lat = req.querystring.lat;
    var long = req.querystring.long;
    var showMap = req.querystring.showMap || false;

    var stores = storeHelpers.getStores(radius, postalCode, lat, long, req.geolocation, showMap);

    res.json(stores);
    next();
});

module.exports = server.exports();
