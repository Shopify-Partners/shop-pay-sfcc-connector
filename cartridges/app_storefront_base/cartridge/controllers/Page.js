'use strict';

/**
 * @namespace Page
 */

var server = require('server');

var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/**
 * Page-Include : This end point is triggered when content assets are embedded within a rendered page ( eg footer content)
 * @name Base/Page-Include
 * @function
 * @memberof Page
 * @param {middleware} - server.middleware.include
 * @param {middleware} - cache.applyDefaultCache
 * @param {querystringparameter} - cid - the id of the content asset to be embeded in a full page
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'Include',
    server.middleware.include,
    cache.applyDefaultCache,
    function (req, res, next) {
        var ContentMgr = require('dw/content/ContentMgr');
        var Logger = require('dw/system/Logger');
        var ContentModel = require('*/cartridge/models/content');

        var apiContent = ContentMgr.getContent(req.querystring.cid);

        if (apiContent) {
            var content = new ContentModel(apiContent, 'components/content/contentAssetInc');
            if (content.template) {
                res.render(content.template, { content: content });
            } else {
                Logger.warn('Content asset with ID {0} is offline', req.querystring.cid);
                res.render('/components/content/offlineContent');
            }
        } else {
            Logger.warn('Content asset with ID {0} was included but not found',
                req.querystring.cid);

            res.render('/components/content/offlineContent');
        }
        next();
    }
);

/**
 * Page-IncludeHeaderMenu : This is a local include that includes the navigation in the header
 * @name Base/Page-IncludeHeaderMenu
 * @function
 * @memberof Page
 * @param {middleware} - server.middleware.include
 * @param {middleware} - cache.applyDefaultCache
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get(
    'IncludeHeaderMenu',
    server.middleware.include,
    cache.applyDefaultCache,
    function (req, res, next) {
        var catalogMgr = require('dw/catalog/CatalogMgr');
        var Categories = require('*/cartridge/models/categories');
        var siteRootCategory = catalogMgr.getSiteCatalog().getRoot();

        var topLevelCategories = siteRootCategory.hasOnlineSubCategories() ?
            siteRootCategory.getOnlineSubCategories() : null;

        res.render('/components/header/menu', new Categories(topLevelCategories));
        next();
    }
);

/**
 * Page-SetLocale : This end point is used to change the locale, language and currency of the site, it is not used in the base site, but it is in the base cartridge
 * @name Base/Page-SetLocale
 * @function
 * @memberof Page
 * @param {querystringparameter} - action - the end point that it should load after changing the locale
 * @param {querystringparameter} - code - the locale code to switch to
 * @param {querystringparameter} - currencyCode - the currency code to be assigned to the site
 * @param {querystringparameter} - queryString - the query string of the current request so that it be reloaded in the new locale (eg pdp)
 * @param {category} - non-sensitive
 * @param {returns} - json
 * @param {serverfunction} - get
 */
server.get('SetLocale', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var Currency = require('dw/util/Currency');
    var Site = require('dw/system/Site');
    var BasketMgr = require('dw/order/BasketMgr');
    var Transaction = require('dw/system/Transaction');

    var currentBasket = BasketMgr.getCurrentBasket();

    var QueryString = server.querystring;
    var currency;
    var currentSite = Site.getCurrent();
    var allowedCurrencies = currentSite.allowedCurrencies;
    var queryStringObj = new QueryString(req.querystring.queryString || '');

    if (Object.hasOwnProperty.call(queryStringObj, 'lang')) {
        delete queryStringObj.lang;
    }

    if (req.setLocale(req.querystring.code)) {
        currency = Currency.getCurrency(req.querystring.CurrencyCode);
        if (allowedCurrencies.indexOf(req.querystring.CurrencyCode) > -1
            && (req.querystring.CurrencyCode !== req.session.currency.currencyCode)) {
            req.session.setCurrency(currency);

            if (currentBasket && currency && currentBasket.currencyCode !== currency.currencyCode) {
                Transaction.wrap(function () {
                    currentBasket.updateCurrency();
                });
            }
        }

        var redirectUrl = URLUtils.url(req.querystring.action).toString();
        var qsConnector = redirectUrl.indexOf('?') >= 0 ? '&' : '?';

        redirectUrl = Object.keys(queryStringObj).length === 0
            ? redirectUrl += queryStringObj.toString()
            : redirectUrl += qsConnector + queryStringObj.toString();

        res.json({
            success: true,
            redirectUrl: redirectUrl
        });
    } else {
        res.json({ error: true }); // TODO: error message
    }
    next();
});

/**
 * Page-Locale : The Page-Locale endpoint is used as a remote include that renders the country selector ISML template
 * @name Base/Page-Locale
 * @function
 * @memberof Page
 * @param {querystringparameter} - mobile - if this value is truthy it will use the mobile version else it will load a more desktop freindly version
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Locale', function (req, res, next) {
    var LocaleModel = require('*/cartridge/models/locale');
    var Locale = require('dw/util/Locale');
    var Site = require('dw/system/Site');

    var currentSite = Site.getCurrent();
    var siteId = currentSite.getID();
    var allowedLocales = currentSite.allowedLocales;
    var currentLocale = Locale.getLocale(req.locale.id);
    var localeModel = new LocaleModel(currentLocale, allowedLocales, siteId);

    var template = req.querystring.mobile
        ? '/components/header/mobileCountrySelector'
        : '/components/header/countrySelector';

    res.render(template, { localeModel: localeModel });
    next();
});

/**
 * Page-Show : This end point will render a content asset in full storefront page
 * @name Base/Page-Show
 * @function
 * @memberof Page
 * @param {middleware} - cache.applyDefaultCache
 * @param {middleware} - consentTracking.consent
 * @param {querystringparameter} - cid - the id of the content asset to be displayed in a full page
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Show', cache.applyDefaultCache, consentTracking.consent, function (req, res, next) {
    var ContentMgr = require('dw/content/ContentMgr');
    var Logger = require('dw/system/Logger');
    var PageMgr = require('dw/experience/PageMgr');
    var ContentModel = require('*/cartridge/models/content');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');

    var page = PageMgr.getPage(req.querystring.cid);

    if (page != null && page.isVisible()) {
        if (!page.hasVisibilityRules()) {
            res.cachePeriod = 168; // eslint-disable-line no-param-reassign
            res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
        }

        res.page(page.ID, {});
    } else {
        var apiContent = ContentMgr.getContent(req.querystring.cid);

        if (apiContent) {
            var content = new ContentModel(apiContent, 'content/contentAsset');

            pageMetaHelper.setPageMetaData(req.pageMetaData, content);
            pageMetaHelper.setPageMetaTags(req.pageMetaData, content);

            if (content.template) {
                res.render(content.template, { content: content });
            } else {
                Logger.warn('Content asset with ID {0} is offline', req.querystring.cid);
                res.render('/components/content/offlineContent');
            }
        } else {
            Logger.warn('Content asset with ID {0} was included but not found', req.querystring.cid);
        }
    }

    next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
