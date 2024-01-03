'use strict';

/**
 * @namespace Search
 */

var server = require('server');

var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/**
 * Search-UpdateGrid : This endpoint is called when the shopper changes the "Sort Order" or clicks "More Results" on the Product List page
 * @name Base/Search-UpdateGrid
 * @function
 * @memberof Search
 * @param {querystringparameter} - cgid - Category ID
 * @param {querystringparameter} - srule - Sort Rule ID
 * @param {querystringparameter} - start - Offset of the Page
 * @param {querystringparameter} - sz - Number of Products to Show on the List Page
 * @param {querystringparameter} - prefn1, prefn2 ... prefn(n) - Names of the selected preferences e.g. refinementColor. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - prefv1, prefv2 ... prefv(n) - Values of the selected preferences e.g. Blue. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - selectedUrl - The URL generated with the query parameters included
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('UpdateGrid', function (req, res, next) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var ProductSearch = require('*/cartridge/models/search/productSearch');

    var apiProductSearch = new ProductSearchModel();
    apiProductSearch = searchHelper.setupSearch(apiProductSearch, req.querystring, req.httpParameterMap);
    apiProductSearch.search();

    if (!apiProductSearch.personalizedSort) {
        searchHelper.applyCache(res);
    }
    var productSearch = new ProductSearch(
        apiProductSearch,
        req.querystring,
        req.querystring.srule,
        CatalogMgr.getSortingOptions(),
        CatalogMgr.getSiteCatalog().getRoot()
    );

    res.render('/search/productGrid', {
        productSearch: productSearch
    });

    next();
});

/**
 * Search-Refinebar : The endpoint Search-Refinebar render the refinement bar on product list page, PLP (i.e. the search result page and category listing page)
 * @name Base/Search-Refinebar
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyDefaultCache
 * @param {querystringparameter} - q - The search string (when submit product search)
 * @param {querystringparameter} - cgid - category ID (when loading category list page)
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Refinebar', cache.applyDefaultCache, function (req, res, next) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var ProductSearch = require('*/cartridge/models/search/productSearch');
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');

    var apiProductSearch = new ProductSearchModel();
    apiProductSearch = searchHelper.setupSearch(apiProductSearch, req.querystring, req.httpParameterMap);
    apiProductSearch.search();
    var productSearch = new ProductSearch(
        apiProductSearch,
        req.querystring,
        req.querystring.srule,
        CatalogMgr.getSortingOptions(),
        CatalogMgr.getSiteCatalog().getRoot()
    );
    res.render('/search/searchRefineBar', {
        productSearch: productSearch,
        querystring: req.querystring
    });

    next();
}, pageMetaData.computedPageMetaData);

/**
 * Search-ShowAjax : This endpoint is called when a shopper click on any of the refinement eg. color, size, categories
 * @name Base/Search-ShowAjax
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyShortPromotionSensitiveCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - cgid - Category ID
 * @param {querystringparameter} - q - query string a shopper is searching for
 * @param {querystringparameter} - prefn1, prefn2 ... prefn(n) - Names of the selected preferences e.g. refinementColor. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - prefv1, prefv2 ... prefv(n) - Values of the selected preferences e.g. Blue. These will be added to the query parameters only when refinements are selected
 * @param {querystringparameter} - pmin - preference for minimum amount
 * @param {querystringparameter} - pmax - preference for maximum amount
 * @param {querystringparameter} - page
 * @param {querystringparameter} - selectedUrl - The URL generated with the query parameters included
 * @param {category} - non-sensitive
 * @param {serverfunction} - get
 */
server.get('ShowAjax', cache.applyShortPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');

    var result = searchHelper.search(req, res);

    if (result.searchRedirect) {
        res.redirect(result.searchRedirect);
        return next();
    }

    res.render('search/searchResultsNoDecorator', {
        productSearch: result.productSearch,
        maxSlots: result.maxSlots,
        reportingURLs: result.reportingURLs,
        refineurl: result.refineurl
    });

    return next();
}, pageMetaData.computedPageMetaData);

/**
 * Search-Show : This endpoint is called when a shopper type a query string in the search box
 * @name Base/Search-Show
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyShortPromotionSensitiveCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - q - query string a shopper is searching for
 * @param {querystringparameter} - search-button
 * @param {querystringparameter} - lang - default is en_US
 * @param {querystringparameter} - cgid - Category ID
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Show', cache.applyShortPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');

    if (req.querystring.cgid) {
        var pageLookupResult = searchHelper.getPageDesignerCategoryPage(req.querystring.cgid);

        if ((pageLookupResult.page && pageLookupResult.page.hasVisibilityRules()) || pageLookupResult.invisiblePage) {
            // the result may be different for another user, do not cache on this level
            // the page itself is a remote include and can still be cached
            res.cachePeriod = 0; // eslint-disable-line no-param-reassign
        }

        if (pageLookupResult.page) {
            res.page(pageLookupResult.page.ID, {}, pageLookupResult.aspectAttributes);
            return next();
        }
    }

    var template = 'search/searchResults';

    var result = searchHelper.search(req, res);

    if (result.searchRedirect) {
        res.redirect(result.searchRedirect);
        return next();
    }

    if (result.category && result.categoryTemplate) {
        template = result.categoryTemplate;
    }

    var redirectGridUrl = searchHelper.backButtonDetection(req.session.clickStream);
    if (redirectGridUrl) {
        res.redirect(redirectGridUrl);
    }

    res.render(template, {
        productSearch: result.productSearch,
        maxSlots: result.maxSlots,
        reportingURLs: result.reportingURLs,
        refineurl: result.refineurl,
        category: result.category ? result.category : null,
        canonicalUrl: result.canonicalUrl,
        schemaData: result.schemaData,
        apiProductSearch: result.apiProductSearch
    });

    return next();
}, pageMetaData.computedPageMetaData);

/**
 * Search-Content : This endpoint is called when a shopper search for something under articles by clicking on the articles tab next to products on Search result page
 * @name Base/Search-Content
 * @function
 * @memberof Search
 * @param {middleware} - cache.applyDefaultCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - q - the query string a shopper is searching for
 * @param {querystringparameter} - startingPage - The starting page to display in the case there are multiple pages returned
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Content', cache.applyDefaultCache, consentTracking.consent, function (req, res, next) {
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');

    var contentSearch = searchHelper.setupContentSearch(req.querystring);
    res.render('/search/contentGrid', {
        contentSearch: contentSearch
    });
    next();
});

module.exports = server.exports();
