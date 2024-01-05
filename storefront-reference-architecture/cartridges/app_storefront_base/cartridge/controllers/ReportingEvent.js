'use strict';

/**
 * @namespace ReportingEvent
 */

var server = require('server');

/**
 * ReportingEvent-Start : Controller that is the module hook for reporting events. Typically no modifications are needed here. Salesforce Commerce Cloud analytics is based on log file analysis. Log file entries are generated using remote includes in page templates. This endpoint's params change depeneding on what is being reported
 * @name Base/ReportingEvent-Start
 * @function
 * @memberof ReportingEvent
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Start', function (req, res, next) {
    res.render('/reporting/reporting');
    next();
});

/**
 * ReportingEvent-MiniCart : The ReportingEvent-MiniCart endpoint get the reporting event basket open
 * @name Base/ReportingEvent-MiniCart
 * @function
 * @memberof ReportingEvent
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('MiniCart', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
    var reportingURLs;
    if (currentBasket && currentBasket.allLineItems.length) {
        reportingURLs = reportingUrlsHelper.getBasketOpenReportingURLs(currentBasket);
    }

    res.render('/reporting/reportingUrls', {
        reportingURLs: reportingURLs
    });
    next();
});

module.exports = server.exports();
